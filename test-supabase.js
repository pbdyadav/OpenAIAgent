const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ayasbxzekgryusbmedia.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5YXNieHpla2dyeXVzYm1lZGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQyNjUwMSwiZXhwIjoyMDg1MDAyNTAxfQ.T0rFV0M9Ip3RdQ9dvZRYc8l2WzKPsU8KXKi8x7IW-4Y'
);

async function test() {
  const { data: convs } = await supabase.from('conversations').select('id, company_id').limit(1);
  if (!convs.length) return console.log('no conv');
  
  const c = convs[0];
  console.log("Trying to insert with type: 'text'...");
  const { error } = await supabase.from('messages').insert({
    company_id: c.company_id,
    conversation_id: c.id,
    role: 'user',
    content: 'test',
    type: 'text'
  });
  
  console.log("Insert Error:", error);

  console.log("Fetching a message to see columns...");
  const { data: msg } = await supabase.from('messages').select('*').limit(1);
  console.log("Columns:", Object.keys(msg[0]));
}

test();
