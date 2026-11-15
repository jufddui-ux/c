const fs = require('fs');
const path = require('path');

const DEFAULT_RENDER_BACKEND = 'https://c-4wgk.onrender.com';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Forward request to Render backend
  const renderUrl = process.env.RENDER_BACKEND_URL || process.env.BACKEND_URL || DEFAULT_RENDER_BACKEND;
  if (renderUrl) {
    try {
      const cleanBase = renderUrl.replace(/\/+$/, '');
      let targetUrl = cleanBase + '/api/products';
      if (req.query && req.query.id) {
        targetUrl += '/' + req.query.id;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (req.headers['x-api-key']) {
        headers['x-api-key'] = req.headers['x-api-key'];
      }

      const fetchRes = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
      });
      const data = await fetchRes.json();
      return res.status(fetchRes.status).json(data);
    } catch (err) {
      console.warn('Render proxy notice:', err.message);
    }
  }

  // 2. Fallback to centralized products.json file in repo
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'products.json'),
    path.join(process.cwd(), 'backend', 'data', 'products.json'),
    path.join(__dirname, '..', 'data', 'products.json'),
    path.join(__dirname, '..', '..', 'data', 'products.json')
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

  return res.status(200).json({ success: true, count: 0, data: [] });
};
