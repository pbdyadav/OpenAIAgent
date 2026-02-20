-- Add subscription plans to the platform
-- Plans: free (50 chats), pro (10000 chats), pro_plus (unlimited)

-- Create plans enum type
DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('free', 'pro', 'pro_plus');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add plan and usage columns to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS plan plan_type DEFAULT 'free',
ADD COLUMN IF NOT EXISTS chat_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chat_limit INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;

-- Create function to get chat limit based on plan
CREATE OR REPLACE FUNCTION get_plan_chat_limit(p plan_type)
RETURNS INTEGER AS $$
BEGIN
  CASE p
    WHEN 'free' THEN RETURN 50;
    WHEN 'pro' THEN RETURN 10000;
    WHEN 'pro_plus' THEN RETURN -1; -- -1 means unlimited
    ELSE RETURN 50;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if company can chat
CREATE OR REPLACE FUNCTION can_company_chat(company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  company_plan plan_type;
  company_chat_count INTEGER;
  company_chat_limit INTEGER;
BEGIN
  SELECT plan, chat_count, chat_limit INTO company_plan, company_chat_count, company_chat_limit
  FROM public.companies
  WHERE id = company_id;
  
  -- Unlimited plan
  IF company_chat_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  RETURN company_chat_count < company_chat_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment chat count
CREATE OR REPLACE FUNCTION increment_chat_count(company_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.companies
  SET chat_count = chat_count + 1
  WHERE id = company_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update chat_limit when plan changes
CREATE OR REPLACE FUNCTION update_chat_limit_on_plan_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.chat_limit := get_plan_chat_limit(NEW.plan);
    NEW.plan_started_at := now();
    -- Reset chat count on plan upgrade
    IF NEW.plan != 'free' THEN
      NEW.chat_count := 0;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chat_limit ON public.companies;

CREATE TRIGGER trigger_update_chat_limit
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_limit_on_plan_change();

-- Update existing companies with correct chat_limit
UPDATE public.companies
SET chat_limit = get_plan_chat_limit(COALESCE(plan, 'free'));
