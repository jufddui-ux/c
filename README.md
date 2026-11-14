# Lakhani Collection — Luxury Pakistani Apparel & Lifestyle

Complete Monorepo structured for **Vercel (Frontend)** and **Render (Backend)** deployment.

---

## 📁 Repository Structure

```
shop/
├── frontend/                     # 🚀 Deploy to VERCEL
│   ├── index.html                # Luxury Storefront (House of Melone UI)
│   ├── admin.html                # Admin Dashboard (Orders, Products, Prices)
│   ├── config.js                 # API URL & Render Bridge configuration
│   ├── vercel.json               # Vercel routing & headers configuration
│   ├── assets/                   # Photorealistic AI Studio catalog images
│   └── package.json
│
├── backend/                      # ⚡ Deploy to RENDER
│   ├── server.js                 # Express.js REST API with CORS enabled
│   ├── package.json              # Express, Multer, Cors dependencies
│   ├── render.yaml               # Render Blueprint configuration
│   ├── data/                     # JSON Database (products, orders, settings)
│   │   ├── products.json
│   │   ├── orders.json
│   │   └── settings.json
│   ├── uploads/                  # Product image uploads
│   └── .gitignore
│
├── vercel.json                   # Root fallback Vercel configuration
└── README.md
```

---

## ⚡ 1. Backend Deployment on Render (`backend/`)

1. Go to **[dashboard.render.com](https://dashboard.render.com/)** and click **New +** → **Web Service**.
2. Connect your GitHub repository: `https://github.com/jufddui-ux/c.git`.
3. Fill in the following settings:
   - **Name:** `lakhani-backend` (or your choice)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`
4. Click **Deploy Web Service**.
5. Once deployed, Render will give you a public URL (e.g. `https://lakhani-backend.onrender.com`).
   - Test it by visiting: `https://lakhani-backend.onrender.com/health` (should show `{"status":"healthy"}`).

---

## 🚀 2. Frontend Deployment on Vercel (`frontend/`)

1. Go to **[vercel.com/new](https://vercel.com/new)** and import your GitHub repository: `https://github.com/jufddui-ux/c.git`.
2. In the **Project Settings**:
   - **Framework Preset:** `Other`
   - **Root Directory:** Click Edit and select `frontend`.
3. Click **Deploy**.
4. Vercel will build and assign you a live domain (e.g. `https://lakhani-collection.vercel.app`).

---

## 🔗 3. Connecting Frontend to Backend

1. Open your live Vercel Admin Panel: `https://your-site.vercel.app/admin`.
2. Go to the **Settings** tab.
3. In the **Backend Server (Render Deployment)** card, paste your Render URL:
   `https://lakhani-backend.onrender.com`
4. Click **Save URL**.
5. That's it! Your Vercel frontend will now instantly communicate with your Render backend for product catalog, image uploads, price edits, and live order bookings.

---

## 💻 Running Locally

```bash
# 1. Run Backend (Port 5000 or 3000)
cd backend
npm install
node server.js

# 2. Open Storefront / Admin
# Open frontend/index.html or frontend/admin.html in your browser!
```

---
© 2026 Lakhani Collection. All rights reserved.
