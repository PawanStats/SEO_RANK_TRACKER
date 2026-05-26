# 🚀 Deployment Guide - SEO Rank Tracker

## Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free)
- API Keys:
  - Google Gemini API
  - Browserbase API

---

## **PART 1: Setup MongoDB Atlas (Database)**

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create account & new project
3. Create a **Free Cluster**
4. Go to **Network Access** → Add IP `0.0.0.0/0` (allow all)
5. Go to **Database Users** → Create user
   - Username: `greatstack`
   - Password: `Trillion2026`
6. Get connection string:
   ```
   mongodb+srv://greatstack:Trillion2026@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```
7. **Copy this string** - you'll need it for Vercel

---

## **PART 2: Prepare Code for Deployment**

### Add to `.gitignore` (if not already there):
```
node_modules/
.env
.env.local
dist/
build/
.DS_Store
```

### Commit your changes:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## **PART 3: Deploy Backend (Server) on Vercel**

### Step 1: Push Server to GitHub
```bash
cd d:\SEO_RANK_TRACKER\Server
git init
git add .
git commit -m "Initial server setup"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repo (Server folder)
4. Configure:
   - **Framework Preset**: `Other`
   - **Build Command**: Leave blank
   - **Output Directory**: Leave blank
   - **Root Directory**: `.` (Server folder)
5. Click **Deploy**

### Step 3: Add Environment Variables
After deployment, go to **Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://greatstack:Trillion2026@cluster.mongodb.net/seo?retryWrites=true&w=majority` |
| `JWT_SECRET` | Generate random string: `openssl rand -hex 32` or use online generator |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `BROWSERBASE_API_KEY` | Your Browserbase API key |
| `FRONTEND_URL` | `https://your-client-vercel-url.vercel.app` (add after deploying client) |

6. Click **Redeploy** after adding variables

**Your Server URL will be**: `https://your-server-name.vercel.app`

---

## **PART 4: Deploy Frontend (Client) on Vercel**

### Step 1: Push Client to GitHub
```bash
cd d:\SEO_RANK_TRACKER\Client
git init
git add .
git commit -m "Initial client setup"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repo (Client folder)
4. Configure:
   - **Framework**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `.` (Client folder)
5. Click **Deploy**

### Step 3: Add Environment Variables
After deployment, go to **Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_BACKEND_URL` | `https://your-server-vercel-url.vercel.app` |

6. Click **Redeploy**

**Your Client URL will be**: `https://your-client-name.vercel.app`

---

## **PART 5: Update Server with Client URL**

Go back to Server's Vercel deployment:
1. **Settings → Environment Variables**
2. Update `FRONTEND_URL` to: `https://your-client-vercel-url.vercel.app`
3. Click **Redeploy**

---

## **Testing**

1. Open your Client URL: `https://your-client-name.vercel.app`
2. Try to **Login/Register**
3. If it works → ✅ Everything is deployed!
4. If it fails → Check:
   - Environment variables are set correctly
   - MongoDB connection string is valid
   - CORS is properly configured
   - API keys are valid

---

## **Troubleshooting**

### "Cannot connect to backend"
- Check `VITE_BACKEND_URL` in Client environment variables
- Verify server URL is correct and accessible
- Check CORS settings in server.js

### "MongoDB connection failed"
- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas (should be `0.0.0.0/0`)
- Ensure database user credentials are correct

### "API Key errors"
- Regenerate API keys if they're invalid
- Check all environment variables are spelled correctly

---

## **Deployment Checklist**

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] GitHub repos created (Client & Server)
- [ ] Server deployed on Vercel
- [ ] Server environment variables added
- [ ] Client deployed on Vercel
- [ ] Client environment variables added
- [ ] FRONTEND_URL updated in Server
- [ ] Login/Register tested and working
- [ ] Analysis features tested and working

---

## **Environment Variables Summary**

### Server (.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GEMINI_API_KEY=...
BROWSERBASE_API_KEY=...
FRONTEND_URL=https://client-url.vercel.app
PORT=5000
```

### Client (.env)
```
VITE_BACKEND_URL=https://server-url.vercel.app
```

---

## **Auto-Deployment**

Every time you push to main branch, Vercel automatically redeploys!

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel will automatically deploy the changes
```

---

**Good luck with your deployment! 🎉**
