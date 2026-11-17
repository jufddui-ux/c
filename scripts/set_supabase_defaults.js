const fs = require('fs');

const urlDefault = "const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sqeibkcuxaierqvnnqiz.supabase.co';";
const keyDefault = "const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZWlia2N1eGFpZXJxdm5ucWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NTY4MjMsImV4cCI6MjExMDMzMjgyM30.4YNNQF5NQAVjSwUef997HBn-zVRitk0jIalqBP4ud80';";

['backend/server.js', 'server.js'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace('const SUPABASE_URL = process.env.SUPABASE_URL;', urlDefault);
  content = content.replace('const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;', keyDefault);
  fs.writeFileSync(f, content, 'utf8');
  console.log('Configured Supabase defaults in', f);
});

