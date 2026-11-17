const fs = require('fs');

['backend/server.js', 'server.js'].forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(
    "database: isSupabaseActive ? 'Supabase PostgreSQL (Cloud Persistent)' : (isMongoConnected ? 'MongoDB Atlas (Cloud Persistent)' : (PERSISTENT_MOUNT ? 'Render Persistent Disk' : 'Local File Storage'),",
    "database: isSupabaseActive ? 'Supabase PostgreSQL (Cloud Persistent)' : (isMongoConnected ? 'MongoDB Atlas (Cloud Persistent)' : (PERSISTENT_MOUNT ? 'Render Persistent Disk' : 'Local File Storage')),"
  );
  fs.writeFileSync(f, code, 'utf8');
});
console.log('Fixed syntax error');

