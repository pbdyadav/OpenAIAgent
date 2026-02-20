import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WhatsAppSetup } from "@/components/dashboard/whatsapp-setup";
import { Smartphone, Sparkles } from "lucide-react";

export default async function WhatsAppPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ✅ SAFE company fetch
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Company not created yet</h2>
        <p className="text-muted-foreground mt-2">
          Please create your company from Settings to enable WhatsApp.
        </p>
      </div>
    );
  }

  // ✅ SAFE WhatsApp config fetch (first time = null)
  const { data: whatsappConfig } = await supabase
    .from("whatsapp_config")
    .select("*")
    .eq("company_id", company.id)
    .maybeSingle();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              WhatsApp Integration
            </h1>
            <p className="text-muted-foreground">
              Connect your WhatsApp Business account to serve customers on WhatsApp
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-accent" />
        <p className="text-sm text-foreground">
          WhatsApp integration allows your AI agent to respond to customers on WhatsApp 24/7.
        </p>
      </div>

      <WhatsAppSetup companyId={company.id} config={whatsappConfig} />
    </div>
  );
}
