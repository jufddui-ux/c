const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. If Render backend URL is configured via environment variable, forward request
  const renderUrl = process.env.RENDER_BACKEND_URL || process.env.BACKEND_URL;
  if (renderUrl) {
    try {
      const targetUrl = renderUrl.replace(/\/+$/, '') + '/api/products' + (req.query && req.query.id ? '/' + req.query.id : '');
      const fetchRes = await fetch(targetUrl, {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
      });
      const data = await fetchRes.json();
      return res.status(fetchRes.status).json(data);
    } catch (err) {
      console.warn('Render proxy error, falling back:', err.message);
    }
  }

  // 2. Serve from products.json on Vercel
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'products.json'),
    path.join(process.cwd(), 'backend', 'data', 'products.json'),
    path.join(__dirname, '..', 'data', 'products.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf-8');
        const products = JSON.parse(raw);
        return res.status(200).json({ success: true, count: products.length, data: products });
      } catch (e) {}
    }
  }

  return res.status(200).json({ success: true, data: [] });
};
