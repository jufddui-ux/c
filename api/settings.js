const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const renderUrl = process.env.RENDER_BACKEND_URL || process.env.BACKEND_URL;
  if (renderUrl) {
    try {
      const targetUrl = renderUrl.replace(/\/+$/, '') + '/api/settings';
      const fetchRes = await fetch(targetUrl, {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
        body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
      });
      const data = await fetchRes.json();
      return res.status(fetchRes.status).json(data);
    } catch (e) {}
  }

  const possiblePaths = [
    path.join(process.cwd(), 'data', 'settings.json'),
    path.join(process.cwd(), 'backend', 'data', 'settings.json'),
    path.join(__dirname, '..', 'data', 'settings.json')
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
