const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ayasbxzekgryusbmedia.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5YXNieHpla2dyeXVzYm1lZGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQyNjUwMSwiZXhwIjoyMDg1MDAyNTAxfQ.T0rFV0M9Ip3RdQ9dvZRYc8l2WzKPsU8KXKi8x7IW-4Y'
);

async function test() {
  const { data: convs } = await supabase.from('conversations').select('id, company_id').limit(1);
  if (!convs.length) return console.log('no conv');
  
  const c = convs[0];
  const payload = {
    conversation_id: c.id,
    role: 'user',
    content: 'test message',
    type: 'text'
  };
  console.log("INSERT USER MESSAGE", payload);
  const { data, error } = await supabase.from('messages').insert(payload).select();
  
  console.log("MESSAGE INSERT DATA", data);
  if (error) {
    console.error("MESSAGE INSERT ERROR", error);
  }
}

test();
