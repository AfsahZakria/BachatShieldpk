# Smooth Deployment Guide for BachatShield 🚀

This guide explains how to deploy BachatShield smoothly across modern cloud platforms with zero headaches.

---

## Method 1: 1-Click Deployment on Render (Recommended for Full-Stack)

Render allows you to deploy the Node.js backend and the frontend in a single unified web service.

1. Create a free account at [render.com](https://render.com).
2. Connect your GitHub account and click **New +** $\rightarrow$ **Web Service**.
3. Select your `bachatshield` repository.
4. Configure the settings:
   - **Name:** `bachatshield`
   - **Environment:** `Node`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `node server/server.js`
   - **Auto-Deploy:** `Yes`
5. Click **Deploy Web Service**.
6. Render will assign you a live HTTPS URL (e.g. `https://bachatshield.onrender.com`).

---

## Method 2: Deployment on Railway (Super Fast)

1. Go to [railway.app](https://railway.app).
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select `bachatshield`.
4. Railway will automatically detect the `Dockerfile` or `server/package.json`.
5. Under **Settings**, set:
   - **Root Directory:** `/` (or `/server`)
   - **Start Command:** `node server/server.js`
6. Click **Generate Domain**. Your website is live!

---

## Method 3: Vercel or Netlify (Frontend-Focused)

If you wish to host the frontend on Vercel or Netlify:

### On Vercel:
1. Install Vercel CLI: `npm i -g vercel` or visit [vercel.com](https://vercel.com).
2. Import the GitHub repository.
3. Set **Root Directory** to `client`.
4. Click **Deploy**. Vercel will host your static frontend worldwide on edge servers.

### On Netlify:
1. Go to [netlify.com](https://netlify.com).
2. Drag and drop the `client/` folder directly into the Netlify dashboard, or link your GitHub repository with publish directory set to `client`.

---

## Method 4: Docker Deployment on Any VPS (DigitalOcean, AWS, Linode)

1. SSH into your server:
   ```bash
   ssh root@your-server-ip
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bachatshield.git
   cd bachatshield
   ```
3. Run with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
4. Configure Nginx with Let's Encrypt SSL for your custom domain (e.g. `bachatshield.pk`).

---

## 🔒 Production Checklist

- [ ] Set `NODE_ENV=production` in your environment settings.
- [ ] Ensure CORS origins in `server/server.js` match your custom production domain.
- [ ] For HTTPS, make sure your domain's SSL certificate is enabled (automatic on Render, Railway, and Vercel).
