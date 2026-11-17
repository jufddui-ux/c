/**
 * Lakhani Collection — Cloud Supabase & API Configuration
 * Dual-Engine Hybrid Persistence (Direct Supabase REST + Express Backend Fallback)
 * Works seamlessly on Render, Vercel, Localhost, and standalone HTML.
 */

(function () {
  const DEFAULT_SUPABASE_URL = 'https://sqeibkcuxaierqvnnqiz.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZWlia2N1eGFpZXJxdm5ucWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NTY4MjMsImV4cCI6MjExMDMzMjgyM30.4YNNQF5NQAVjSwUef997HBn-zVRitk0jIalqBP4ud80';
  const DEFAULT_STORAGE_BUCKET = 'product-media';
  const DEFAULT_BACKEND_URL = 'https://c-4wgk.onrender.com';

  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) || '';
  const protocol = (typeof window !== 'undefined' && window.location && window.location.protocol) || '';

  const isLocal = !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || protocol === 'file:';
  const isBackendHost = hostname.includes('onrender.com') || hostname.includes('render.com') || hostname.includes('trycloudflare.com') || hostname.includes('railway.app');
  const savedBackend = (typeof localStorage !== 'undefined') ? localStorage.getItem('LAKHANI_BACKEND_URL') : null;

  if (isBackendHost) {
    window.API_BASE = window.location.origin;
  } else if (savedBackend) {
    window.API_BASE = savedBackend.replace(/\/+$/, '');
  } else if (isLocal) {
    window.API_BASE = protocol === 'file:' ? 'http://localhost:5000' : '';
  } else {
    window.API_BASE = DEFAULT_BACKEND_URL;
  }

  window.getSupabaseConfig = function () {
    let url = DEFAULT_SUPABASE_URL;
    let key = DEFAULT_SUPABASE_KEY;
    let bucket = DEFAULT_STORAGE_BUCKET;
    let isCustom = false;

    if (typeof localStorage !== 'undefined') {
      const u = localStorage.getItem('LAKHANI_SUPABASE_URL');
      const k = localStorage.getItem('LAKHANI_SUPABASE_KEY');
      const b = localStorage.getItem('LAKHANI_SUPABASE_BUCKET');
      if (u) url = u.trim().replace(/\/+$/, '');
      if (k) key = k.trim();
      if (b) bucket = b.trim();
      isCustom = Boolean(u || k);
    }

    return { url, key, bucket, isCustom };
  };

  window.setSupabaseConfig = function (url, key, bucket) {
    if (typeof localStorage !== 'undefined') {
      if (!url || !key) {
        localStorage.removeItem('LAKHANI_SUPABASE_URL');
        localStorage.removeItem('LAKHANI_SUPABASE_KEY');
        localStorage.removeItem('LAKHANI_SUPABASE_BUCKET');
      } else {
        localStorage.setItem('LAKHANI_SUPABASE_URL', url.trim().replace(/\/+$/, ''));
        localStorage.setItem('LAKHANI_SUPABASE_KEY', key.trim());
        if (bucket && bucket.trim()) {
          localStorage.setItem('LAKHANI_SUPABASE_BUCKET', bucket.trim());
        } else {
          localStorage.removeItem('LAKHANI_SUPABASE_BUCKET');
        }
      }
    }
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  };

  window.apiUrl = function (endpoint) {
    if (!endpoint) return window.API_BASE || '';
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    if (!window.API_BASE) return cleanEndpoint;
    return window.API_BASE + cleanEndpoint;
  };

  window.isLegacyUploadPath = function (path) {
    if (!path || typeof path !== 'string') return false;
    return path.startsWith('/uploads/') || path.startsWith('uploads/');
  };

  window.formatImgUrl = function (path) {
    if (!path) return 'assets/hero_banner.webp';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
      return path;
    }
    if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
      const clean = path.startsWith('/') ? path : '/' + path;
      const base = window.API_BASE || DEFAULT_BACKEND_URL;
      return base.replace(/\/+$/, '') + clean;
    }
    return path;
  };

  window.setBackendUrl = function (newUrl) {
    if (typeof localStorage !== 'undefined') {
      if (!newUrl) {
        localStorage.removeItem('LAKHANI_BACKEND_URL');
      } else {
        localStorage.setItem('LAKHANI_BACKEND_URL', newUrl.trim().replace(/\/+$/, ''));
      }
    }
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  };

  // Browser-side WebP / JPEG image compression for permanent zero-loss DB storage
  window.compressImageToDataUrl = function (file, maxDimension = 900, maxBytes = 135 * 1024) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Invalid image file'));
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width || 800;
          let height = img.naturalHeight || img.height || 800;
          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = Math.max(1, Math.round(width * ratio));
            height = Math.max(1, Math.round(height * ratio));
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const encode = (w, h, mime, q) => {
            canvas.width = w;
            canvas.height = h;
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            return canvas.toDataURL(mime, q);
          };

          const supportsWebp = encode(2, 2, 'image/webp', 0.8).startsWith('data:image/webp');
          const mime = supportsWebp ? 'image/webp' : 'image/jpeg';

          let quality = 0.82;
          let dataUrl = encode(width, height, mime, quality);

          while (dataUrl.length > maxBytes * 1.37 && quality > 0.45) {
            quality -= 0.12;
            dataUrl = encode(width, height, mime, quality);
          }
          if (dataUrl.length > maxBytes * 1.37) {
            const scale = 0.72;
            dataUrl = encode(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)), mime, 0.65);
          }

          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not decode image file'));
      };
      img.src = objectUrl;
    });
  };

  async function sbRest(path, options = {}) {
    const { url, key } = window.getSupabaseConfig();
    const headers = {
      apikey: key,
      Authorization: 'Bearer ' + key,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    };

    const cleanPath = path.replace(/^\/+/, '');
    const res = await fetch(url + '/rest/v1/' + cleanPath, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: 'no-store'
    });

    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) {}

    if (!res.ok) {
      const msg = (json && (json.message || json.error || json.hint || json.details)) || text || ('HTTP ' + res.status);
      throw new Error(msg);
    }
    return json;
  }

  let cachedActiveBucket = null;
  let bucketProbeDone = false;

  async function probeStorageBucket(bucketName) {
    const { url, key } = window.getSupabaseConfig();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 900);
      const res = await fetch(`${url}/storage/v1/object/public/${encodeURIComponent(bucketName)}/__probe__`, {
        headers: { apikey: key },
        signal: controller.signal
      });
      clearTimeout(timer);
      const text = await res.text();
      if (text.includes('NoSuchBucket') || text.includes('Bucket not found')) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async function findWritableBucket() {
    if (cachedActiveBucket) return cachedActiveBucket;
    if (bucketProbeDone) return null;

    const { bucket } = window.getSupabaseConfig();
    if (!bucket) {
      bucketProbeDone = true;
      return null;
    }

    try {
      const exists = await probeStorageBucket(bucket);
      if (exists) {
        cachedActiveBucket = bucket;
        return bucket;
      }
    } catch (e) {}

    bucketProbeDone = true;
    return null;
  }

  async function uploadToSupabaseBucket(file, bucketName) {
    const { url, key } = window.getSupabaseConfig();
    const origExt = (file.name && file.name.includes('.')) ? file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    const ext = origExt || (file.type && file.type.startsWith('video/') ? 'mp4' : 'webp');
    const safeName = `media-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const objectPath = `catalog/${safeName}`;

    const res = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucketName)}/${objectPath}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true'
      },
      body: file
    });

    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) {}

    if (!res.ok) {
      const msg = (json && (json.message || json.error)) || text || ('HTTP ' + res.status);
      throw new Error(msg);
    }

    return `${url}/storage/v1/object/public/${encodeURIComponent(bucketName)}/${objectPath}`;
  }

  window.sbApi = {
    async checkHealth() {
      try {
        const data = await sbRest('products?select=id&limit=1');
        const bucket = await findWritableBucket();
        return {
          ok: Array.isArray(data),
          storageBucket: bucket,
          storageMode: bucket ? `Supabase Storage CDN (${bucket})` : 'Supabase Cloud DB + Permanent WebP'
        };
      } catch (err) {
        // Fallback check against Render backend /health
        try {
          const base = window.apiUrl ? window.apiUrl('/health') : '/health';
          const r = await fetch(base, { cache: 'no-store' });
          const j = await r.json();
          return {
            ok: j.status === 'healthy',
            storageBucket: null,
            storageMode: 'Supabase via Backend API'
          };
        } catch (backendErr) {
          throw err;
        }
      }
    },

    async getStorageBucket() {
      return await findWritableBucket();
    },

    async getProducts(filters = {}) {
      // 1. Direct Supabase Cloud REST
      try {
        let query = 'products?select=*';
        if (filters.category && filters.category !== 'all') {
          query += `&category=eq.${encodeURIComponent(filters.category)}`;
        }
        if (filters.search && filters.search.trim()) {
          query += `&title=ilike.*${encodeURIComponent(filters.search.trim())}*`;
        }
        if (filters.sort === 'price-low') {
          query += '&order=price.asc';
        } else if (filters.sort === 'price-high') {
          query += '&order=price.desc';
        } else {
          query += '&order=createdAt.desc.nullslast';
        }
        const data = await sbRest(query);
        if (Array.isArray(data)) return data;
      } catch (sbErr) {
        console.warn('Supabase direct query failed, trying backend fallback:', sbErr.message);
      }

      // 2. Fallback to Express backend /api/products
      try {
        const params = new URLSearchParams();
        if (filters.category && filters.category !== 'all') params.set('category', filters.category);
        if (filters.search && filters.search.trim()) params.set('search', filters.search.trim());
        if (filters.sort) params.set('sort', filters.sort);
        const qStr = params.toString() ? '?' + params.toString() : '';
        const endpoint = window.apiUrl ? window.apiUrl('/api/products' + qStr) : ('/api/products' + qStr);
        const res = await fetch(endpoint, { cache: 'no-store' });
        const json = await res.json();
        if (Array.isArray(json)) return json;
        if (json && Array.isArray(json.data)) return json.data;
      } catch (backendErr) {
        console.warn('Backend fallback failed:', backendErr.message);
      }

      // 3. Fallback to static preloaded window.INITIAL_PRODUCTS
      if (typeof window !== 'undefined' && Array.isArray(window.INITIAL_PRODUCTS)) {
        return window.INITIAL_PRODUCTS;
      }
      return [];
    },

    async createProduct(product) {
      // 1. Direct Supabase Cloud REST
      try {
        const rows = await sbRest('products', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: [product]
        });
        if (Array.isArray(rows) && rows[0]) return rows[0];
      } catch (sbErr) {
        console.warn('Supabase direct create failed, trying backend POST /api/products:', sbErr.message);
      }

      // 2. Fallback to Express backend
      const endpoint = window.apiUrl ? window.apiUrl('/api/products') : '/api/products';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const json = await res.json();
      if (json && json.success && json.data) return json.data;
      if (!res.ok) throw new Error(json.message || ('HTTP ' + res.status));
      return product;
    },

    async updateProduct(id, patch) {
      // 1. Direct Supabase Cloud REST
      try {
        const rows = await sbRest(`products?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: patch
        });
        if (Array.isArray(rows) && rows[0]) return rows[0];
      } catch (sbErr) {
        console.warn('Supabase direct update failed, trying backend PUT /api/products/:id:', sbErr.message);
      }

      // 2. Fallback to Express backend
      const endpoint = window.apiUrl ? window.apiUrl(`/api/products/${encodeURIComponent(id)}`) : `/api/products/${encodeURIComponent(id)}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const json = await res.json();
      if (json && json.success && json.data) return json.data;
      if (!res.ok) throw new Error(json.message || ('HTTP ' + res.status));
      return patch;
    },

    async deleteProduct(id) {
      // 1. Direct Supabase Cloud REST
      try {
        await sbRest(`products?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { Prefer: 'return=representation' }
        });
        return true;
      } catch (sbErr) {
        console.warn('Supabase direct delete failed, trying backend DELETE /api/products/:id:', sbErr.message);
      }

      // 2. Fallback to Express backend
      const endpoint = window.apiUrl ? window.apiUrl(`/api/products/${encodeURIComponent(id)}`) : `/api/products/${encodeURIComponent(id)}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || ('HTTP ' + res.status));
      return true;
    },

    async getOrders() {
      try {
        const data = await sbRest('orders?select=*&order=createdAt.desc.nullslast');
        if (Array.isArray(data)) return data;
      } catch (sbErr) {
        console.warn('Supabase direct orders query failed, trying backend fallback:', sbErr.message);
      }

      try {
        const endpoint = window.apiUrl ? window.apiUrl('/api/orders') : '/api/orders';
        const res = await fetch(endpoint, { cache: 'no-store' });
        const json = await res.json();
        if (Array.isArray(json)) return json;
        if (json && Array.isArray(json.data)) return json.data;
      } catch (e) {}

      return [];
    },

    async createOrder(order) {
      try {
        const rows = await sbRest('orders', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: [order]
        });
        if (Array.isArray(rows) && rows[0]) return rows[0];
      } catch (sbErr) {
        console.warn('Supabase direct order creation failed, trying backend POST /api/orders:', sbErr.message);
      }

      const endpoint = window.apiUrl ? window.apiUrl('/api/orders') : '/api/orders';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const json = await res.json();
      if (json && json.success && json.data) return json.data;
      return order;
    },

    async updateOrderStatus(id, patch) {
      try {
        const rows = await sbRest(`orders?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: patch
        });
        if (Array.isArray(rows) && rows[0]) return rows[0];
      } catch (sbErr) {
        console.warn('Supabase direct order status update failed, trying backend fallback:', sbErr.message);
      }

      const endpoint = window.apiUrl ? window.apiUrl(`/api/orders/${encodeURIComponent(id)}/status`) : `/api/orders/${encodeURIComponent(id)}/status`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || ('HTTP ' + res.status));
      return patch;
    },

    async deleteOrder(id) {
      try {
        await sbRest(`orders?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { Prefer: 'return=representation' }
        });
        return true;
      } catch (sbErr) {
        console.warn('Supabase direct order delete failed, trying backend fallback:', sbErr.message);
      }

      const endpoint = window.apiUrl ? window.apiUrl(`/api/orders/${encodeURIComponent(id)}`) : `/api/orders/${encodeURIComponent(id)}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || ('HTTP ' + res.status));
      return true;
    },

    async getSettings() {
      try {
        const rows = await sbRest('settings?select=*&key=eq.store_settings&limit=1');
        if (Array.isArray(rows) && rows[0] && rows[0].data) {
          return rows[0].data;
        }
      } catch (sbErr) {
        console.warn('Supabase direct settings query failed, trying backend fallback:', sbErr.message);
      }

      try {
        const endpoint = window.apiUrl ? window.apiUrl('/api/settings') : '/api/settings';
        const res = await fetch(endpoint, { cache: 'no-store' });
        const json = await res.json();
        if (json && json.success && json.data) return json.data;
      } catch (e) {}

      return {};
    },

    async saveSettings(settingsData) {
      try {
        const rows = await sbRest('settings?on_conflict=key', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: [{ key: 'store_settings', data: settingsData }]
        });
        if (Array.isArray(rows) && rows[0] && rows[0].data) return rows[0].data;
      } catch (sbErr) {
        console.warn('Supabase direct settings save failed, trying backend PUT /api/settings:', sbErr.message);
      }

      const endpoint = window.apiUrl ? window.apiUrl('/api/settings') : '/api/settings';
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      const json = await res.json();
      if (json && json.success && json.data) return json.data;
      return settingsData;
    },

    async uploadMedia(file) {
      const isVideo = Boolean((file.type && file.type.startsWith('video/')) || /\.(mp4|webm|mov|mkv)$/i.test(file.name || ''));
      const bucket = await findWritableBucket();

      if (bucket) {
        try {
          const publicUrl = await uploadToSupabaseBucket(file, bucket);
          return {
            url: publicUrl,
            filename: file.name,
            isVideo,
            storage: `supabase-storage:${bucket}`
          };
        } catch (err) {
          console.warn('Supabase Storage upload fallback notice:', err.message);
          if (isVideo) {
            throw new Error(`Supabase Storage upload failed (${err.message}). Check Storage RLS policies on bucket "${bucket}" or paste a direct video URL.`);
          }
        }
      }

      if (isVideo) {
        // Fallback to Express backend /api/upload
        try {
          const formData = new FormData();
          formData.append('media', file);
          const endpoint = window.apiUrl ? window.apiUrl('/api/upload') : '/api/upload';
          const res = await fetch(endpoint, { method: 'POST', body: formData });
          const json = await res.json();
          if (json.success && json.file && json.file.url) {
            return {
              url: json.file.url,
              filename: file.name,
              isVideo: true,
              storage: 'backend-disk'
            };
          }
        } catch (backendUploadErr) {}
        throw new Error('Supabase Storage bucket "product-media" is not set up yet for video uploads. Click "Storage Setup SQL" in the top bar or paste a direct MP4 URL.');
      }

      // Permanent zero-config storage for images: compressed WebP stored directly in Supabase PostgreSQL
      const dataUrl = await window.compressImageToDataUrl(file);
      return {
        url: dataUrl,
        filename: file.name,
        isVideo: false,
        storage: 'embedded-webp'
      };
    }
  };
})();
