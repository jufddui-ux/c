/**
 * Lakhani Collection — Frontend API Configuration
 * Supports Localhost, Vercel Frontend, and Render Backend
 */

(function () {
  const hostname = window.location.hostname || '';
  const protocol = window.location.protocol || '';

  // 1. Check if running on local machine
  const isLocal = !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || protocol === 'file:';

  // 2. Check if running directly on Render or Cloudflare tunnel server
  const isBackendHost = hostname.includes('onrender.com') || hostname.includes('render.com') || hostname.includes('trycloudflare.com') || hostname.includes('railway.app');

  // 3. Auto-detect backend from URL query parameters (e.g. ?backend=https://your-app.onrender.com)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const backendParam = urlParams.get('backend') || urlParams.get('api');
    if (backendParam) {
      const cleanParam = backendParam.trim().replace(/\/+$/, '');
      localStorage.setItem('LAKHANI_BACKEND_URL', cleanParam);
      console.log('✅ Auto-linked Backend from URL:', cleanParam);
    }
  } catch (e) {}

  // 4. Saved backend from localStorage
  const savedBackend = localStorage.getItem('LAKHANI_BACKEND_URL');

  // 5. Determine active API Base URL
  if (isBackendHost) {
    // When running directly on Render, ALWAYS use current origin! Never call another domain!
    window.API_BASE = window.location.origin;
    // Auto-save this origin so if admin tests here, it's memorized
    localStorage.setItem('LAKHANI_BACKEND_URL', window.location.origin);
  } else if (savedBackend) {
    window.API_BASE = savedBackend.replace(/\/+$/, '');
  } else if (isLocal) {
    window.API_BASE = protocol === 'file:' ? 'http://localhost:3000' : '';
  } else {
    // On Vercel / Cloud without custom URL: use relative /api routes
    window.API_BASE = '';
  }

  // Helper function to build full API endpoints
  window.apiUrl = function (endpoint) {
    if (!endpoint) return window.API_BASE;
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    if (!window.API_BASE) return cleanEndpoint;
    return window.API_BASE + cleanEndpoint;
  };

  // Helper function to format image paths (handles relative, absolute, and /uploads/ from Render)
  window.formatImgUrl = function (path) {
    if (!path) return 'assets/hero_banner.webp';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    // Handle uploaded media from backend /uploads/ directory
    if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
      const clean = path.startsWith('/') ? path : '/' + path;
      const base = window.API_BASE || localStorage.getItem('LAKHANI_BACKEND_URL') || '';
      if (base) {
        return base.replace(/\/+$/, '') + clean;
      }
      return clean;
    }
    return path;
  };

  // Helper to change backend URL dynamically
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

  console.log('🌐 Connected Backend API URL:', window.API_BASE || '(Relative / Same Origin)');
})();
