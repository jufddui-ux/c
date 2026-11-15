const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const renderUrl = process.env.RENDER_BACKEND_URL || process.env.BACKEND_URL;
  if (renderUrl) {
    try {
      const targetUrl = renderUrl.replace(/\/+$/, '') + '/api/orders' + (req.query && req.query.id ? '/' + req.query.id : '');
      const fetchRes = await fetch(targetUrl, {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
        body: ['POST', 'PUT'].includes(req.method) ? JSON.stringify(req.body) : undefined
      });
      const data = await fetchRes.json();
      return res.status(fetchRes.status).json(data);
    } catch (e) {}
  }

  if (req.method === 'POST') {
    const orderId = 'LC-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }),
      ...req.body,
      status: 'Pending Verification'
    };
    return res.status(201).json({ success: true, message: 'Order received. Awaiting advance payment verification.', data: newOrder });
  }

  return res.status(200).json({ success: true, data: [] });
};
