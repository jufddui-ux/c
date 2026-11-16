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

  const rawId = req.query && req.query.id ? String(req.query.id).trim() : '';
  const orderId = rawId.replace(/\/status$/, '');

  try {
    if (req.method === 'GET') {
      const data = await sbRequest('orders?select=*&order=createdAt.desc.nullslast');
      return res.status(200).json({ success: true, count: data.length, data });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.customerName || !body.customerPhone || !Array.isArray(body.items) || body.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Name, phone, and items are required' });
      }
      const now = new Date();
      const newOrder = {
        id: body.id || 'LC-' + Math.floor(100000 + Math.random() * 900000),
        date: body.date || now.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: body.createdAt || now.toISOString(),
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerCity: body.customerCity || 'Pakistan',
        customerAddress: body.customerAddress || '',
        paymentMethod: body.paymentMethod || 'Easypaisa',
        paymentStatus: body.paymentStatus || 'Pending Advance Verification',
        items: body.items,
        subtotal: Number(body.subtotal) || 0,
        deliveryFee: Number(body.deliveryFee) || 250,
        grandTotal: Number(body.grandTotal) || 0,
        status: body.status || 'Pending Verification'
      };
      const rows = await sbRequest('orders', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: [newOrder]
      });
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully. Awaiting advance payment verification.',
        data: (rows && rows[0]) || newOrder
      });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!orderId) return res.status(400).json({ success: false, message: 'Order ID required' });
      const { status, paymentStatus } = req.body || {};
      const patch = {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        updatedAt: new Date().toISOString()
      };
      const rows = await sbRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: patch
      });
      if (!Array.isArray(rows) || !rows[0]) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.status(200).json({ success: true, message: 'Order status updated', data: rows[0] });
    }

    if (req.method === 'DELETE') {
      if (!orderId) return res.status(400).json({ success: false, message: 'Order ID required' });
      await sbRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=representation' }
      });
      return res.status(200).json({ success: true, message: 'Order removed' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) {
    console.error('Supabase orders API error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
