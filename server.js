const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// High-speed Gzip/Brotli compression for multiple concurrent clients
app.use(compression({
  threshold: 1024 // Compress all responses > 1KB
}));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Database Helpers
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

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

// High-Performance Browser Caching for Media Assets (Fast loading for multiple clients)
const staticCacheOptions = {
  maxAge: '30d',
  immutable: true,
  etag: true,
  lastModified: true
};

// Serve Static Frontends & Media
app.use('/assets', express.static(path.join(__dirname, 'assets'), staticCacheOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticCacheOptions));
app.use(express.static(__dirname, { maxAge: '1h', etag: true }));

// ==========================================
// 1. PRODUCTS REST API
// ==========================================

// Get all products (with optional filtering)
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
      (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
      (p.fabric && p.fabric.toLowerCase().includes(q)) ||
      (p.colors && p.colors.some(c => c.toLowerCase().includes(q)))
    );
  }

  if (sort === 'price-low') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'name') {
    products.sort((a, b) => a.title.localeCompare(b.title));
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
  const initialLen = products.length;
  products = products.filter(p => p.id !== req.params.id);
  if (products.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  writeData(PRODUCTS_FILE, products);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// ==========================================
// 2. ORDERS REST API (Booking & Management)
// ==========================================

// Get all orders (Admin)
app.get('/api/orders', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  res.json({ success: true, count: orders.length, data: orders });
});

// Place new order (Customer Storefront)
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
    return res.status(400).json({ success: false, message: 'Customer details and items are required' });
  }

  const orderId = 'LC-' + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    id: orderId,
    customerName,
    customerPhone,
    customerCity: customerCity || 'Pakistan',
    customerAddress,
    paymentMethod: paymentMethod || 'Easypaisa',
    items,
    subtotal: Number(subtotal),
    deliveryFee: Number(deliveryFee),
    grandTotal: Number(grandTotal),
    status: 'Pending Verification',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  writeData(ORDERS_FILE, orders);
  res.status(201).json({ success: true, message: 'Order booked successfully', data: newOrder });
});

// Update order status (Admin)
app.put('/api/orders/:id/status', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

  order.status = status;
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
// 3. SETTINGS & ACCOUNTS API
// ==========================================

app.get('/api/settings', (req, res) => {
  const settings = readData(SETTINGS_FILE, {});
  res.json({ success: true, data: settings });
});

app.put('/api/settings', (req, res) => {
  const current = readData(SETTINGS_FILE, {});
  const updated = { ...current, ...req.body };
  writeData(SETTINGS_FILE, updated);
  res.json({ success: true, message: 'Settings saved', data: updated });
});

// ==========================================
// 4. STATS & ANALYTICS API (Admin Dashboard)
// ==========================================

app.get('/api/stats', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  const products = readData(PRODUCTS_FILE, []);

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const pendingPayments = orders.filter(o => o.status === 'Pending Verification').length;
  const dispatchedOrders = orders.filter(o => o.status === 'Dispatched' || o.status === 'Delivered').length;

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

// File Upload endpoint
app.post('/api/upload', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: 'Upload limit exceeded: ' + err.message });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Upload error: ' + err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or invalid file format' });
    }
    const fileUrl = '/uploads/' + req.file.filename;
    res.json({ success: true, url: fileUrl, filename: req.file.filename });
  });
});

// Route for Admin Dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback to Storefront
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lakhani Collection Backend running at http://localhost:${PORT}`);
  console.log(`🛍️ Storefront: http://localhost:${PORT}`);
  console.log(`⚙️ Admin Dashboard: http://localhost:${PORT}/admin`);
});
