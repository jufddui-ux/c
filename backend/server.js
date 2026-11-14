const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vercel, localhost, and custom domains
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Multer Storage Configuration for Render
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Max File Size
});

// Database File Paths
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function readData(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading ' + filePath, err);
    return fallback;
  }
}

function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing ' + filePath, err);
    return false;
  }
}

// Serve Uploaded Media
app.use('/uploads', express.static(UPLOADS_DIR));

// ==========================================
// Health & Diagnostic Endpoints (For Render)
// ==========================================
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Lakhani Collection Backend API',
    platform: 'Render.com',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      settings: '/api/settings',
      stats: '/api/stats',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ==========================================
// 1. PRODUCTS REST API
// ==========================================

// Get all products
app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  let products = readData(PRODUCTS_FILE, []);

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    products = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.fabric && p.fabric.toLowerCase().includes(q)) ||
      (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q))
    );
  }

  if (sort === 'price-low') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    products.sort((a, b) => b.price - a.price);
  }

  res.json({ success: true, count: products.length, data: products });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const products = readData(PRODUCTS_FILE, []);
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// Add new product (Admin)
app.post('/api/products', (req, res) => {
  const products = readData(PRODUCTS_FILE, []);
  const {
    title,
    category,
    categoryLabel,
    badge,
    badgeColor,
    price,
    originalPrice,
    aiImage,
    colorsImage,
    flyerImage,
    fabric,
    description,
    sizes,
    colors,
    stock
  } = req.body;

  if (!title || !price) {
    return res.status(400).json({ success: false, message: 'Title and price are required' });
  }

  const id = req.body.id || 'prod_' + Date.now();
  const newProduct = {
    id,
    title,
    category: category || 'women',
    categoryLabel: categoryLabel || 'Collection',
    badge: badge || 'New Arrival',
    badgeColor: badgeColor || 'bg-amber-900/90 text-amber-300 border-amber-700',
    originalPrice: Number(originalPrice) || Number(price) + 500,
    price: Number(price),
    aiImage: aiImage || 'assets/hero_banner.jpg',
    colorsImage: colorsImage || aiImage || 'assets/hero_banner.jpg',
    flyerImage: flyerImage || aiImage || 'assets/hero_banner.jpg',
    fabric: fabric || 'Premium Cotton / Lawn',
    description: description || 'High quality Pakistani luxury design.',
    specs: req.body.specs || [{ label: 'Quality', val: 'Premium' }],
    sizes: sizes || [{ name: 'Standard Fit', desc: 'Universal' }],
    colors: colors || ['Standard'],
    stock: Number(stock) || 25,
    createdAt: new Date().toISOString()
  };

  products.unshift(newProduct);
  writeData(PRODUCTS_FILE, products);
  res.status(201).json({ success: true, message: 'Product added successfully', data: newProduct });
});

// Edit existing product (Admin)
app.put('/api/products/:id', (req, res) => {
  const products = readData(PRODUCTS_FILE, []);
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  const updated = {
    ...products[index],
    ...req.body,
    price: req.body.price ? Number(req.body.price) : products[index].price,
    originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : products[index].originalPrice,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : products[index].stock,
    updatedAt: new Date().toISOString()
  };

  products[index] = updated;
  writeData(PRODUCTS_FILE, products);
  res.json({ success: true, message: 'Product updated successfully', data: updated });
});

// Delete product (Admin)
app.delete('/api/products/:id', (req, res) => {
  let products = readData(PRODUCTS_FILE, []);
  const beforeLen = products.length;
  products = products.filter(p => p.id !== req.params.id);
  if (products.length === beforeLen) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  writeData(PRODUCTS_FILE, products);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// ==========================================
// 2. ORDERS REST API
// ==========================================

// Get all orders
app.get('/api/orders', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  res.json({ success: true, count: orders.length, data: orders });
});

// Book new customer order
app.post('/api/orders', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  const {
    customerName,
    customerPhone,
    customerCity,
    customerAddress,
    paymentMethod,
    items,
    subtotal,
    deliveryFee,
    grandTotal
  } = req.body;

  if (!customerName || !customerPhone || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Name, phone, and items are required' });
  }

  const orderId = 'LC-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

  const newOrder = {
    id: orderId,
    date: dateFormatted,
    createdAt: now.toISOString(),
    customerName,
    customerPhone,
    customerCity: customerCity || 'Pakistan',
    customerAddress: customerAddress || '',
    paymentMethod: paymentMethod || 'Easypaisa',
    paymentStatus: 'Pending Advance Verification',
    items,
    subtotal: Number(subtotal) || 0,
    deliveryFee: Number(deliveryFee) || 250,
    grandTotal: Number(grandTotal) || 0,
    status: 'Pending Verification'
  };

  orders.unshift(newOrder);
  writeData(ORDERS_FILE, orders);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully. Awaiting advance payment verification.',
    data: newOrder
  });
});

// Update order status (Admin)
app.put('/api/orders/:id/status', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { status, paymentStatus } = req.body;
  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  order.updatedAt = new Date().toISOString();

  writeData(ORDERS_FILE, orders);
  res.json({ success: true, message: 'Order status updated', data: order });
});

// Delete order (Admin)
app.delete('/api/orders/:id', (req, res) => {
  let orders = readData(ORDERS_FILE, []);
  orders = orders.filter(o => o.id !== req.params.id);
  writeData(ORDERS_FILE, orders);
  res.json({ success: true, message: 'Order removed' });
});

// ==========================================
// 3. SETTINGS & ACCOUNTS REST API
// ==========================================

// Get Store Settings
app.get('/api/settings', (req, res) => {
  const settings = readData(SETTINGS_FILE, {});
  res.json({ success: true, data: settings });
});

// Update Store Settings (Admin)
app.put('/api/settings', (req, res) => {
  const current = readData(SETTINGS_FILE, {});
  const updated = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeData(SETTINGS_FILE, updated);
  res.json({ success: true, message: 'Store settings updated successfully', data: updated });
});

// ==========================================
// 4. STATS & ANALYTICS API
// ==========================================
app.get('/api/stats', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  const products = readData(PRODUCTS_FILE, []);

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const pendingPayments = orders.filter(o => o.status === 'Pending Verification').length;
  const dispatchedOrders = orders.filter(o => o.status === 'Dispatched').length;

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders: orders.length,
      activeProducts: products.length,
      pendingPayments,
      dispatchedOrders
    }
  });
});

// ==========================================
// 5. FILE UPLOAD ENDPOINT
// ==========================================
app.post('/api/upload', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: 'Upload limit exceeded: ' + err.message });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Upload error: ' + err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or invalid format' });
    }
    const fileUrl = '/uploads/' + req.file.filename;
    res.json({ success: true, url: fileUrl, filename: req.file.filename });
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lakhani Collection Backend running on port ${PORT}`);
  console.log(`📡 Ready for Render / Vercel integration`);
});

