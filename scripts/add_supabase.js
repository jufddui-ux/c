const fs = require('fs');
const path = require('path');

const targetFiles = ['backend/server.js', 'server.js'];

targetFiles.forEach(relPath => {
  if (!fs.existsSync(relPath)) return;
  let code = fs.readFileSync(relPath, 'utf8');

  // Add import if not present
  if (!code.includes('@supabase/supabase-js')) {
    code = code.replace(
      "const mongoose = require('mongoose');",
      "const mongoose = require('mongoose');\nconst { createClient } = require('@supabase/supabase-js');"
    );
  }

  // Supabase block
  const supabaseBlock = `
// ==========================================
// SUPABASE CLOUD PERSISTENCE (Free Lifetime PostgreSQL)
// ==========================================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;
let isSupabaseActive = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    isSupabaseActive = true;
    console.log('⚡ Supabase Cloud PostgreSQL Active (Zero Firewall Friction)');
  } catch (err) {
    console.error('Supabase Init Error:', err.message);
  }
}
`;

  if (!code.includes('isSupabaseActive = true')) {
    code = code.replace(
      '// ==========================================\n// MONGODB CLOUD PERSISTENCE',
      supabaseBlock + '\n// ==========================================\n// MONGODB CLOUD PERSISTENCE'
    );
    if (!code.includes('isSupabaseActive = true')) {
      code = code.replace(
        '// ==========================================\r\n// MONGODB CLOUD PERSISTENCE',
        supabaseBlock + '\r\n// ==========================================\r\n// MONGODB CLOUD PERSISTENCE'
      );
    }
  }

  // Update /health endpoint to reflect Supabase
  code = code.replace(
    "database: isMongoConnected ? 'MongoDB Atlas (Cloud Persistent)' :",
    "database: isSupabaseActive ? 'Supabase PostgreSQL (Cloud Persistent)' : isMongoConnected ? 'MongoDB Atlas (Cloud Persistent)' :"
  );

  code = code.replace(
    "persistentStorage: isMongoConnected || Boolean(PERSISTENT_MOUNT),",
    "persistentStorage: isSupabaseActive || isMongoConnected || Boolean(PERSISTENT_MOUNT),"
  );

  // Update /api GET endpoint
  code = code.replace(
    "database: isMongoConnected ? 'MongoDB Atlas (Cloud Persistent)' : (PERSISTENT_MOUNT ?",
    "database: isSupabaseActive ? 'Supabase PostgreSQL (Cloud Persistent)' : (isMongoConnected ? 'MongoDB Atlas (Cloud Persistent)' : (PERSISTENT_MOUNT ?"
  );

  fs.writeFileSync(relPath, code, 'utf8');
  console.log('Successfully updated', relPath);
});

