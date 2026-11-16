/**
 * Lakhani Collection — Cloud Supabase & API Configuration
 * Works seamlessly on Vercel, Render, Localhost, and standalone HTML.
 */

(function () {
  const DEFAULT_SUPABASE_URL = 'https://sqeibkcuxaierqvnnqiz.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZWlia2N1eGFpZXJxdm5ucWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NTY4MjMsImV4cCI6MjExMDMzMjgyM30.4YNNQF5NQAVjSwUef997HBn-zVRitk0jIalqBP4ud80';
  const DEFAULT_STORAGE_BUCKET = 'product-media';
  const FALLBACK_BUCKETS = ['product-media', 'media', 'products', 'uploads'];
  const DEFAULT_BACKEND_URL = 'https://c-4wgk.onrender.com';

  const hostname = window.location.hostname || '';
  const protocol = window.location.protocol || '';

  const isLocal = !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || protocol === 'file:';
  const isBackendHost = hostname.includes('onrender.com') || hostname.includes('render.com') || hostname.includes('trycloudflare.com') || hostname.includes('railway.app');
  const savedBackend = localStorage.getItem('LAKHANI_BACKEND_URL');

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
    const url = (localStorage.getItem('LAKHANI_SUPABASE_URL') || DEFAULT_SUPABASE_URL).trim().replace(/\/+$/, '');
    const key = (localStorage.getItem('LAKHANI_SUPABASE_KEY') || DEFAULT_SUPABASE_KEY).trim();
    const bucket = (localStorage.getItem('LAKHANI_SUPABASE_BUCKET') || DEFAULT_STORAGE_BUCKET).trim();
    return {
      url,
      key,
      bucket,
      isCustom: Boolean(localStorage.getItem('LAKHANI_SUPABASE_URL') || localStorage.getItem('LAKHANI_SUPABASE_KEY'))
    };
  };

  window.setSupabaseConfig = function (url, key, bucket) {
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
    window.location.reload();
  };

  window.apiUrl = function (endpoint) {
    if (!endpoint) return window.API_BASE;
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
    if (!newUrl) {
      localStorage.removeItem('LAKHANI_BACKEND_URL');
      window.location.reload();
      return;
    }
    const clean = newUrl.trim().replace(/\/+$/, '');
    localStorage.setItem('LAKHANI_BACKEND_URL', clean);
    window.API_BASE = clean;
    window.location.reload();
  };

  // Compress image in-browser to permanent lightweight WebP/JPEG data URL
  // Used automatically when Supabase Storage bucket has not been created yet
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

          // Step down quality/dimensions if still too large for fast PostgreSQL JSON rows
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

    const res = await fetch(url + '/rest/v1/' + path.replace(/^\/+/, ''), {
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

  async function probeStorageBucket(bucketName) {
    const { url, key } = window.getSupabaseConfig();
    try {
      const res = await fetch(`${url}/storage/v1/object/public/${encodeURIComponent(bucketName)}/__probe__`, {
        headers: { apikey: key }
      });
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
    const { bucket } = window.getSupabaseConfig();
    const candidates = [bucket, ...FALLBACK_BUCKETS].filter((v, i, a) => v && a.indexOf(v) === i);
    for (const b of candidates) {
      if (await probeStorageBucket(b)) {
        cachedActiveBucket = b;
        return b;
      }
    }
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
      const data = await sbRest('products?select=id&limit=1');
      const bucket = await findWritableBucket();
      return {
        ok: Array.isArray(data),
        storageBucket: bucket,
        storageMode: bucket ? `Supabase Storage (${bucket})` : 'Supabase DB + Embedded WebP'
      };
    },

    async getStorageBucket() {
      return await findWritableBucket();
    },

    async getProducts(filters = {}) {
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
      return Array.isArray(data) ? data : [];
    },

    async createProduct(product) {
      const rows = await sbRest('products', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: [product]
      });
      return Array.isArray(rows) && rows[0] ? rows[0] : product;
    },

    async updateProduct(id, patch) {
      const rows = await sbRest(`products?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: patch
      });
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('Product not found in Supabase');
      }
      return rows[0];
    },

    async deleteProduct(id) {
      await sbRest(`products?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=representation' }
      });
      return true;
    },

    async getOrders() {
      const data = await sbRest('orders?select=*&order=createdAt.desc.nullslast');
      return Array.isArray(data) ? data : [];
    },

    async createOrder(order) {
      const rows = await sbRest('orders', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: [order]
      });
      return Array.isArray(rows) && rows[0] ? rows[0] : order;
    },

    async updateOrderStatus(id, patch) {
      const rows = await sbRest(`orders?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: patch
      });
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('Order not found in Supabase');
      }
      return rows[0];
    },

    async deleteOrder(id) {
      await sbRest(`orders?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=representation' }
      });
      return true;
    },

    async getSettings() {
      const rows = await sbRest('settings?select=*&key=eq.store_settings&limit=1');
      if (Array.isArray(rows) && rows[0] && rows[0].data) {
        return rows[0].data;
      }
      return {};
    },

    async saveSettings(settingsData) {
      const rows = await sbRest('settings?on_conflict=key', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: [{ key: 'store_settings', data: settingsData }]
      });
      return Array.isArray(rows) && rows[0] && rows[0].data ? rows[0].data : settingsData;
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
