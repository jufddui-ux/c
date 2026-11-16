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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const productId = req.query && req.query.id ? String(req.query.id).trim() : '';

  try {
    if (req.method === 'GET') {
      if (productId) {
        const rows = await sbRequest(`products?select=*&id=eq.${encodeURIComponent(productId)}&limit=1`);
        if (!Array.isArray(rows) || !rows[0]) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
        return res.status(200).json({ success: true, data: rows[0] });
      }

      const { category, search, sort } = req.query || {};
      let query = 'products?select=*';
      if (category && category !== 'all') query += `&category=eq.${encodeURIComponent(category)}`;
      if (search) query += `&title=ilike.*${encodeURIComponent(String(search).trim())}*`;
      if (sort === 'price-low') query += '&order=price.asc';
      else if (sort === 'price-high') query += '&order=price.desc';
      else query += '&order=createdAt.desc.nullslast';

      const data = await sbRequest(query);
      return res.status(200).json({ success: true, count: data.length, data });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.title || body.price === undefined) {
        return res.status(400).json({ success: false, message: 'Title and price are required' });
      }
      const nowIso = new Date().toISOString();
      const primaryImg = body.aiImage || (Array.isArray(body.gallery) && body.gallery[0]) || 'assets/hero_banner.webp';
      const newProduct = {
        ...body,
        id: body.id || 'prod_' + Date.now(),
        price: Number(body.price),
        originalPrice: Number(body.originalPrice) || Number(body.price) + 500,
        stock: body.stock !== undefined ? Number(body.stock) : 25,
        aiImage: primaryImg,
        gallery: Array.isArray(body.gallery) && body.gallery.length ? body.gallery : [primaryImg],
        createdAt: body.createdAt || nowIso,
        updatedAt: nowIso
      };
      const rows = await sbRequest('products', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: [newProduct]
      });
      return res.status(201).json({ success: true, message: 'Product added', data: (rows && rows[0]) || newProduct });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });
      const patch = { ...(req.body || {}), updatedAt: new Date().toISOString() };
      delete patch.id;
      const rows = await sbRequest(`products?id=eq.${encodeURIComponent(productId)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: patch
      });
      if (!Array.isArray(rows) || !rows[0]) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, message: 'Product updated', data: rows[0] });
    }

    if (req.method === 'DELETE') {
      if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });
      await sbRequest(`products?id=eq.${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=representation' }
      });
      return res.status(200).json({ success: true, message: 'Product deleted' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) {
    console.error('Supabase products API error:', err.message);

    if (req.method === 'GET' && !productId) {
      const possiblePaths = [
        path.join(process.cwd(), 'data', 'products.json'),
        path.join(process.cwd(), 'backend', 'data', 'products.json'),
        path.join(__dirname, '..', 'data', 'products.json'),
        path.join(__dirname, '..', '..', 'data', 'products.json')
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          try {
            const products = JSON.parse(fs.readFileSync(p, 'utf-8'));
            return res.status(200).json({ success: true, count: products.length, data: products, fallback: true });
          } catch (e) {}
        }
      }
    }

    return res.status(500).json({ success: false, message: err.message });
  }
};
