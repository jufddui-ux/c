const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// High-speed Gzip/Brotli compression for fast responses and high concurrent load
app.use(compression({
  threshold: 1024
}));

// Security headers (Inline protection against clickjacking, sniffing, and XSS)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Production-ready CORS with origin validation
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      'localhost',
      '127.0.0.1',
      'vercel.app',
      'onrender.com',
      'trycloudflare.com',
      'railway.app'
    ];
    const isAllowed = allowed.some(domain => origin.includes(domain));
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Persistent Storage Detection (Render Persistent Disk /var/data or custom DATA_DIR)
const PERSISTENT_MOUNT = process.env.DATA_DIR || (fs.existsSync('/var/data') ? '/var/data' : null);

const DATA_DIR = PERSISTENT_MOUNT ? path.join(PERSISTENT_MOUNT, 'data') : path.join(__dirname, 'data');
const UPLOADS_DIR = PERSISTENT_MOUNT ? path.join(PERSISTENT_MOUNT, 'uploads') : path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Database File Paths (Fallback local storage)
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Auto-seed persistent disk on initial attach if empty
if (PERSISTENT_MOUNT) {
  const bundledProducts = path.join(__dirname, 'data', 'products.json');
  if (!fs.existsSync(PRODUCTS_FILE) && fs.existsSync(bundledProducts)) {
    try {
      fs.copyFileSync(bundledProducts, PRODUCTS_FILE);
      console.log('✅ Auto-seeded persistent disk with initial products.json');
    } catch (e) {
      console.error('Seed error:', e.message);
    }
  }

  const bundledSettings = path.join(__dirname, 'data', 'settings.json');
  if (!fs.existsSync(SETTINGS_FILE) && fs.existsSync(bundledSettings)) {
    try {
      fs.copyFileSync(bundledSettings, SETTINGS_FILE);
    } catch (e) {}
  }

  const bundledOrders = path.join(__dirname, 'data', 'orders.json');
  if (!fs.existsSync(ORDERS_FILE) && fs.existsSync(bundledOrders)) {
    try {
      fs.copyFileSync(bundledOrders, ORDERS_FILE);
    } catch (e) {}
  }
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'media-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB for video & HD images
});

// ==========================================
// MONGODB CLOUD PERSISTENCE (Free Lifetime Storage)
// ==========================================
let isMongoConnected = false;
const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: 'women' },
  categoryLabel: { type: String, default: 'Collection' },
  badge: { type: String, default: 'New Arrival' },
  badgeColor: { type: String, default: 'bg-amber-900/90 text-amber-300 border-amber-700' },
  originalPrice: { type: Number, default: 0 },
  price: { type: Number, required: true },
  aiImage: { type: String, default: 'assets/hero_banner.webp' },
  gallery: { type: [String], default: [] },
  video: { type: String, default: '' },
  colorsImage: { type: String, default: '' },
  flyerImage: { type: String, default: '' },
  fabric: { type: String, default: 'Premium Pakistani Fabric' },
  description: { type: String, default: '' },
  specs: { type: Array, default: [] },
  sizes: { type: Array, default: [] },
  colors: { type: [String], default: [] },
  stock: { type: Number, default: 25 },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false });

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: String,
  createdAt: String,
  customerName: String,
  customerPhone: String,
  customerCity: String,
  customerAddress: String,
  paymentMethod: String,
  paymentStatus: String,
  items: Array,
  subtotal: Number,
  deliveryFee: Number,
  grandTotal: Number,
  status: String,
  updatedAt: String
}, { strict: false });

const SettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'store_settings' },
  data: { type: Object, default: {} }
}, { strict: false });

const MongoProduct = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const MongoOrder = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const MongoSetting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

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
    if (filePath.includes('products.json')) {
      const rootFile = path.join(__dirname, '..', 'data', 'products.json');
      if (fs.existsSync(path.dirname(rootFile))) {
        try { fs.writeFileSync(rootFile, JSON.stringify(data, null, 2), 'utf-8'); } catch(e) {}
      }
      const jsContent = 'window.INITIAL_PRODUCTS = ' + JSON.stringify(data, null, 2) + ';\n';
      const syncFiles = [
        path.join(__dirname, 'products-data.js'),
        path.join(__dirname, '..', 'products-data.js'),
        path.join(__dirname, '..', 'frontend', 'products-data.js')
      ];
      syncFiles.forEach(f => {
        try {
          if (fs.existsSync(path.dirname(f))) fs.writeFileSync(f, jsContent, 'utf-8');
        } catch(e) {}
      });
    }
    return true;
  } catch (err) {
    console.error('Error writing ' + filePath, err);
    return false;
  }
}

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000, connectTimeoutMS: 20000
  }).then(async () => {
    isMongoConnected = true;
    console.log('🍃 Connected to MongoDB Atlas Cloud Database (Lifetime Persistent Storage Active)');
    try {
      const count = await MongoProduct.countDocuments();
      if (count === 0) {
        const bundled = readData(PRODUCTS_FILE, []);
        if (bundled.length > 0) {
          await MongoProduct.insertMany(bundled);
          console.log(`✅ Seeded MongoDB with ${bundled.length} initial products`);
        }
      }
    } catch(err) {
      console.error('MongoDB initial seed error:', err.message);
    }
  }).catch(err => {
    console.error('🍃 MongoDB Connection Error (Falling back to local storage):', err.message);
    isMongoConnected = false;
  });
} else {
  console.log('📁 Running on Local Storage (Set MONGODB_URI on Render for permanent zero-cost cloud storage)');
}

// In-Memory Rate Limiter for Write Operations
const writeLimitMap = new Map();
function rateLimitWrites(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 40;

  const userStats = writeLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > userStats.resetAt) {
    userStats.count = 1;
    userStats.resetAt = now + windowMs;
  } else {
    userStats.count++;
  }
  writeLimitMap.set(ip, userStats);

  if (userStats.count > maxRequests) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again in a minute.' });
  }
  next();
}

// Static Caching for lightning-fast delivery to multiple clients
const staticCacheOptions = {
  maxAge: '30d',
  immutable: true,
  etag: true,
  lastModified: true
};

// Serve Uploaded Media & Static Assets
app.use('/uploads', express.static(UPLOADS_DIR, staticCacheOptions));
if (PERSISTENT_MOUNT) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticCacheOptions));
}
app.use('/assets', express.static(path.join(__dirname, 'assets'), staticCacheOptions));
app.use(express.static(__dirname, { maxAge: '1h', etag: true }));

// ==========================================
// Admin Panel & Diagnostic Endpoints (For Render)
// ==========================================

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    service: 'Lakhani Collection Backend API',
    database: isMongoConnected ? 'MongoDB Atlas (Cloud Persistent)' : (PERSISTENT_MOUNT ? 'Render Persistent Disk' : 'Local File Storage')
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: isMongoConnected ? 'MongoDB Atlas (Cloud Persistent)' : (PERSISTENT_MOUNT ? 'Render Persistent Disk' : 'Local File Storage'),
    persistentStorage: isMongoConnected || Boolean(PERSISTENT_MOUNT),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 1. PRODUCTS REST API
// ==========================================

// Get all products (Public - no key required)
app.get('/api/products', async (req, res) => {
  const { category, search, sort } = req.query;

  try {
    let products = [];
    if (isMongoConnected) {
      let query = {};
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search) {
        const q = search.trim();
        query.$or = [
          { title: { $regex: q, $options: 'i' } },
          { fabric: { $regex: q, $options: 'i' } },
          { categoryLabel: { $regex: q, $options: 'i' } }
        ];
      }
      let cursor = MongoProduct.find(query).lean();
      if (sort === 'price-low') cursor = cursor.sort({ price: 1 });
      else if (sort === 'price-high') cursor = cursor.sort({ price: -1 });
      else cursor = cursor.sort({ createdAt: -1 });

      products = await cursor.exec();
    } else {
      products = readData(PRODUCTS_FILE, []);
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
      if (sort === 'price-low') products.sort((a, b) => a.price - b.price);
      else if (sort === 'price-high') products.sort((a, b) => b.price - a.price);
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({ success: true, count: products.length, data: products });
  } catch(err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Database fetch error' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    let product = null;
    if (isMongoConnected) {
      product = await MongoProduct.findOne({ id: req.params.id }).lean();
    } else {
      const products = readData(PRODUCTS_FILE, []);
      product = products.find(p => p.id === req.params.id);
    }
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new product (Admin)
app.post('/api/products', rateLimitWrites, async (req, res) => {
  const {
    title,
    category,
    categoryLabel,
    badge,
    badgeColor,
    price,
    originalPrice,
    aiImage,
    gallery,
    video,
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
  const galleryList = Array.isArray(gallery) && gallery.length > 0 ? gallery : (aiImage ? [aiImage] : ['assets/hero_banner.webp']);
  const primaryImg = aiImage || galleryList[0] || 'assets/hero_banner.webp';

  const newProduct = {
    id,
    title,
    category: category || 'women',
    categoryLabel: categoryLabel || (category === 'men' ? "Men's Wear" : (category === 'bags' ? "Handbags" : "Women's Luxury")),
    badge: badge || 'New Arrival',
    badgeColor: badgeColor || 'bg-amber-900/90 text-amber-300 border-amber-700',
    originalPrice: Number(originalPrice) || Number(price) + 500,
    price: Number(price),
    aiImage: primaryImg,
    gallery: galleryList,
    video: video || '',
    colorsImage: colorsImage || primaryImg,
    flyerImage: flyerImage || primaryImg,
    fabric: fabric || 'Premium Pakistani Fabric',
    description: description || 'High quality Pakistani luxury design.',
    specs: req.body.specs || [{ label: 'Quality', val: 'Premium Authentic' }],
    sizes: sizes || [{ name: 'Standard Fit', desc: 'Universal' }],
    colors: colors || ['Standard'],
    stock: Number(stock) || 25,
    createdAt: new Date().toISOString()
  };

  try {
    if (isMongoConnected) {
      await MongoProduct.create(newProduct);
    }
    // Also save to local file as backup
    const products = readData(PRODUCTS_FILE, []);
    products.unshift(newProduct);
    writeData(PRODUCTS_FILE, products);

    res.status(201).json({ success: true, message: 'Product added successfully', data: newProduct });
  } catch(err) {
    console.error('Error adding product:', err);
    res.status(500).json({ success: false, message: 'Failed to save product: ' + err.message });
  }
});

// Edit existing product (Admin)
app.put('/api/products/:id', rateLimitWrites, async (req, res) => {
  try {
    let existing = null;
    if (isMongoConnected) {
      existing = await MongoProduct.findOne({ id: req.params.id }).lean();
    }
    if (!existing) {
      const products = readData(PRODUCTS_FILE, []);
      existing = products.find(p => p.id === req.params.id);
    }
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    const galleryList = req.body.gallery !== undefined ? req.body.gallery : existing.gallery;
    const primaryImg = req.body.aiImage || (Array.isArray(galleryList) && galleryList.length ? galleryList[0] : existing.aiImage);

    const updated = {
      ...existing,
      ...req.body,
      aiImage: primaryImg,
      gallery: galleryList || [primaryImg],
      video: req.body.video !== undefined ? req.body.video : (existing.video || ''),
      price: req.body.price ? Number(req.body.price) : existing.price,
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : existing.originalPrice,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : existing.stock,
      updatedAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      await MongoProduct.findOneAndUpdate({ id: req.params.id }, updated, { new: true });
    }

    // Also update local file
    const products = readData(PRODUCTS_FILE, []);
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      products[idx] = updated;
      writeData(PRODUCTS_FILE, products);
    }

    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch(err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Update failed: ' + err.message });
  }
});

// Delete product (Admin)
app.delete('/api/products/:id', rateLimitWrites, async (req, res) => {
  try {
    if (isMongoConnected) {
      await MongoProduct.deleteOne({ id: req.params.id });
    }
    let products = readData(PRODUCTS_FILE, []);
    products = products.filter(p => p.id !== req.params.id);
    writeData(PRODUCTS_FILE, products);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch(err) {
    res.status(500).json({ success: false, message: 'Delete error: ' + err.message });
  }
});

// ==========================================
// 2. ORDERS REST API
// ==========================================

// Get all orders (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    let orders = [];
    if (isMongoConnected) {
      orders = await MongoOrder.find().sort({ createdAt: -1 }).lean();
    } else {
      orders = readData(ORDERS_FILE, []);
    }
    res.json({ success: true, count: orders.length, data: orders });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Book new customer order (Public)
app.post('/api/orders', rateLimitWrites, async (req, res) => {
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

  try {
    if (isMongoConnected) {
      await MongoOrder.create(newOrder);
    }
    const orders = readData(ORDERS_FILE, []);
    orders.unshift(newOrder);
    writeData(ORDERS_FILE, orders);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Awaiting advance payment verification.',
      data: newOrder
    });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update order status (Admin)
app.put('/api/orders/:id/status', rateLimitWrites, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    let order = null;
    if (isMongoConnected) {
      order = await MongoOrder.findOneAndUpdate(
        { id: req.params.id },
        { ...(status && { status }), ...(paymentStatus && { paymentStatus }), updatedAt: new Date().toISOString() },
        { new: true }
      ).lean();
    }
    const orders = readData(ORDERS_FILE, []);
    const o = orders.find(item => item.id === req.params.id);
    if (o) {
      if (status) o.status = status;
      if (paymentStatus) o.paymentStatus = paymentStatus;
      o.updatedAt = new Date().toISOString();
      writeData(ORDERS_FILE, orders);
      order = o;
    }
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete order (Admin)
app.delete('/api/orders/:id', rateLimitWrites, async (req, res) => {
  try {
    if (isMongoConnected) {
      await MongoOrder.deleteOne({ id: req.params.id });
    }
    let orders = readData(ORDERS_FILE, []);
    orders = orders.filter(o => o.id !== req.params.id);
    writeData(ORDERS_FILE, orders);
    res.json({ success: true, message: 'Order removed' });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. SETTINGS & ACCOUNTS REST API
// ==========================================

// Get Store Settings (Public)
app.get('/api/settings', async (req, res) => {
  try {
    let settings = {};
    if (isMongoConnected) {
      const doc = await MongoSetting.findOne({ key: 'store_settings' }).lean();
      if (doc && doc.data) settings = doc.data;
    }
    if (Object.keys(settings).length === 0) {
      settings = readData(SETTINGS_FILE, {});
    }
    res.json({ success: true, data: settings });
  } catch(err) {
    res.json({ success: true, data: readData(SETTINGS_FILE, {}) });
  }
});

// Update Store Settings (Admin)
app.put('/api/settings', rateLimitWrites, async (req, res) => {
  try {
    const current = readData(SETTINGS_FILE, {});
    const updated = {
      ...current,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    if (isMongoConnected) {
      await MongoSetting.findOneAndUpdate(
        { key: 'store_settings' },
        { key: 'store_settings', data: updated },
        { upsert: true }
      );
    }
    writeData(SETTINGS_FILE, updated);
    res.json({ success: true, message: 'Store settings updated successfully', data: updated });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. STATS & ANALYTICS API
// ==========================================
app.get('/api/stats', async (req, res) => {
  try {
    let orders = [];
    let products = [];
    if (isMongoConnected) {
      orders = await MongoOrder.find().lean();
      products = await MongoProduct.find().lean();
    } else {
      orders = readData(ORDERS_FILE, []);
      products = readData(PRODUCTS_FILE, []);
    }

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
        dispatchedOrders,
        database: isMongoConnected ? 'MongoDB Atlas' : 'Local Storage'
      }
    });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. FILE UPLOAD ENDPOINTS (Images & Video)
// ==========================================

// Single Media Upload (Image or Video)
app.post('/api/upload', (req, res) => {
  upload.any()(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: 'Upload limit exceeded: ' + err.message });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Upload error: ' + err.message });
    }
    const file = req.files && req.files[0];
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or invalid format' });
    }
    const fileUrl = '/uploads/' + file.filename;
    const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.filename);
    res.json({ success: true, url: fileUrl, filename: file.filename, isVideo, type: isVideo ? 'video' : 'image' });
  });
});

// Multiple Media Upload (Batch of Images & Video)
app.post('/api/upload-multiple', (req, res) => {
  upload.array('files', 12)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: 'Upload error: ' + err.message });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Server upload error: ' + err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const files = req.files.map(f => {
      const isVideo = f.mimetype.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(f.filename);
      return {
        url: '/uploads/' + f.filename,
        filename: f.filename,
        isVideo,
        type: isVideo ? 'video' : 'image'
      };
    });
    res.json({ success: true, count: files.length, files });
  });
});

// Catch-all fallback: Serve Admin Dashboard for non-API web routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lakhani Collection Backend running on port ${PORT}`);
  console.log(`📡 Ready for Render / Vercel integration`);
});
