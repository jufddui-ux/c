const fs = require('fs');
const path = require('path');

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://sqeibkcuxaierqvnnqiz.supabase.co').replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZWlia2N1eGFpZXJxdm5ucWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NTY4MjMsImV4cCI6MjExMDMzMjgyM30.4YNNQF5NQAVjSwUef997HBn-zVRitk0jIalqBP4ud80';

async function sbRequest(restPath, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${restPath}`, {
    method: options.method || 'GET',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) {}
  if (!res.ok) {
    const errMsg = (json && (json.message || json.error || json.hint)) || text || `HTTP ${res.status}`;
    throw new Error(errMsg);
  }
  return json;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const rows = await sbRequest('settings?select=*&key=eq.store_settings&limit=1');
      if (Array.isArray(rows) && rows[0] && rows[0].data) {
        return res.status(200).json({ success: true, data: rows[0].data });
      }
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const existingRows = await sbRequest('settings?select=*&key=eq.store_settings&limit=1');
      const existingData = (Array.isArray(existingRows) && existingRows[0] && existingRows[0].data) || {};
      const updated = {
        ...existingData,
        ...(req.body || {}),
        updatedAt: new Date().toISOString()
      };
      const rows = await sbRequest('settings?on_conflict=key', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: [{ key: 'store_settings', data: updated }]
      });
      return res.status(200).json({
        success: true,
        message: 'Store settings updated successfully',
        data: (rows && rows[0] && rows[0].data) || updated
      });
    }
  } catch (err) {
    console.error('Supabase settings API error:', err.message);
    if (req.method !== 'GET') {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  const possiblePaths = [
    path.join(process.cwd(), 'data', 'settings.json'),
    path.join(process.cwd(), 'backend', 'data', 'settings.json'),
    path.join(__dirname, '..', 'data', 'settings.json'),
    path.join(__dirname, '..', '..', 'data', 'settings.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const settings = JSON.parse(fs.readFileSync(p, 'utf-8'));
        return res.status(200).json({ success: true, data: settings });
      } catch (e) {}
    }
  }

  return res.status(200).json({ success: true, data: {} });
};
