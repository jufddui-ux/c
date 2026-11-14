/**
 * Lakhani Collection — Frontend API Configuration
 * Supports Localhost, Vercel Frontend, and Render Backend
 */

(function () {
  const hostname = window.location.hostname || '';
  const protocol = window.location.protocol || '';
  const isLocal = !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || protocol === 'file:';

  // Saved custom backend URL (from Admin Settings or LocalStorage)
  const savedBackend = localStorage.getItem('LAKHANI_BACKEND_URL');

  // Determine active API base
  if (savedBackend) {
    window.API_BASE = savedBackend.replace(/\/+$/, '');
  } else if (isLocal) {
    window.API_BASE = protocol === 'file:' ? 'http://localhost:3000' : '';
  } else {
    // Cloud / Vercel default (empty relative or fallback)
    window.API_BASE = '';
  }

  // Helper function to build full API endpoints
  window.apiUrl = function (endpoint) {
    if (!endpoint) return window.API_BASE;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    if (!window.API_BASE) return cleanEndpoint;
    return window.API_BASE + cleanEndpoint;
  };

  // Helper function to format image paths (handles relative, absolute, and /uploads/ from Render)
  window.formatImgUrl = function (path) {
    if (!path) return 'assets/hero_banner.jpg';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    if (path.startsWith('/uploads/')) {
      return (window.API_BASE ? window.API_BASE : '') + path;
    }
    if (path.startsWith('uploads/')) {
      return (window.API_BASE ? window.API_BASE : '') + '/' + path;
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

  console.log('🌐 Connected Backend API URL:', window.API_BASE || '(Same Origin / Local)');
})();
