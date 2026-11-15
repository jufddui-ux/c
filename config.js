/**
 * Lakhani Collection — Frontend API Configuration
 * Supports Localhost, Vercel Serverless, and Render Backend
 */

(function () {
  const DEFAULT_BACKEND_URL = 'https://c-4wgk.onrender.com';
  const hostname = window.location.hostname || '';
  const protocol = window.location.protocol || '';

  // 1. Check if running on local machine
  const isLocal = !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || protocol === 'file:';

  // 2. Check if running directly on Render or Cloudflare tunnel server
  const isBackendHost = hostname.includes('onrender.com') || hostname.includes('render.com') || hostname.includes('trycloudflare.com') || hostname.includes('railway.app');

  // 3. Saved backend from localStorage (override if needed)
  const savedBackend = localStorage.getItem('LAKHANI_BACKEND_URL');

  // 4. Determine active API Base URL
  if (isBackendHost) {
    // When running directly on Render/Backend, use current origin
    window.API_BASE = window.location.origin;
  } else if (savedBackend) {
    window.API_BASE = savedBackend.replace(/\/+$/, '');
  } else if (isLocal) {
    window.API_BASE = protocol === 'file:' ? 'http://localhost:5000' : '';
  } else {
    // On Vercel / Cloud: Direct seamless link to Render Backend
    window.API_BASE = DEFAULT_BACKEND_URL;
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
      const base = window.API_BASE || DEFAULT_BACKEND_URL;
      return base.replace(/\/+$/, '') + clean;
    }
    return path;
  };

  // Helper to change backend URL dynamically if needed
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
})();
