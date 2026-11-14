# Lakhani Collection — Luxury Pakistani Apparel & Lifestyle

Official repository for **Lakhani Collection** (`https://houseofmelone.com/` inspired minimalist luxury e-commerce platform & management portal).

## Features

- **Storefront (`index.html`):**
  - Minimalist aesthetic inspired by House of Melone.
  - 100% Mobile First UX with 2-column grid, drawer navigation, and bottom sheets.
  - Complete collections: Tracksuits, Pashmina, Summer Lawn, Cardigans, Sweaters, Farshi, Slippers, Handbags, and Jewelry.
  - Instant WhatsApp checkout & receipt generator.
  - Strict **Advance Payment Policy** badge & account copy buttons (Meezan Bank, Easypaisa, OPay).

- **Backend & REST API (`server.js`):**
  - Express.js architecture with JSON data store (`data/products.json`, `data/orders.json`, `data/settings.json`).
  - Endpoints:
    - `GET /api/products` & `POST /api/products`
    - `PUT /api/products/:id` & `DELETE /api/products/:id`
    - `GET /api/orders` & `POST /api/orders` & `PATCH /api/orders/:id/status`
    - `GET /api/settings` & `PUT /api/settings`
    - `GET /api/stats`
    - `POST /api/upload` (Multer image upload)

- **Admin Portal (`admin.html`):**
  - Direct URL: `/admin`
  - Live revenue & order status analytics.
  - Add new products with image upload, custom pricing, stock, fabric, colors & sizes.
  - Order booking desk with status management (Pending, Verified, Dispatched, Delivered, Cancelled) & 1-click WhatsApp customer reply.
  - Settings manager to update payment account numbers and delivery charges without editing code.

## Quick Start

```bash
# Install dependencies
npm install

# Start backend server
node server.js
```
The server will run on `http://localhost:3000` (Store) and `http://localhost:3000/admin` (Admin Dashboard).

---
© 2026 Lakhani Collection. All rights reserved.
