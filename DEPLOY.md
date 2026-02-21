# 🚀 Deployment Guide — Digital Library System

Two separate Vercel projects: **Backend (Django)** + **Frontend (React/Vite)**.

---

## Step 1 – Deploy the Backend first

### 1.1 Push to GitHub
Make sure your code is pushed to GitHub. Ensure `firebase-credentials.json` is in `.gitignore` — **never commit it**.

### 1.2 Create a new Vercel project for the backend
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `backend`
4. **Framework Preset**: leave as **Other**
5. **Build Command**: `bash build_files.sh`
6. **Output Directory**: `staticfiles_build/static`
7. Click **Deploy**

### 1.3 Set Environment Variables (Backend)
Go to your backend Vercel project → **Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `SECRET_KEY` | A long random string |
| `DEBUG` | `False` |
| `DB_NAME` | `railway` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | Your Railway DB password |
| `DB_HOST` | `shortline.proxy.rlwy.net` |
| `DB_PORT` | `40877` |
| `FIREBASE_CREDENTIALS_JSON` | Contents of `firebase-credentials.json` as one line *(see below)* |
| `FIREBASE_STORAGE_BUCKET` | `your-project-id.appspot.com` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` *(set after frontend deploy)* |
| `VERCEL_FRONTEND_URL` | Same as `FRONTEND_URL` |
| `EMAIL_HOST_USER` | `ak.csproject@gmail.com` |
| `EMAIL_HOST_PASSWORD` | Your Gmail App Password |
| `DEFAULT_FROM_EMAIL` | `Digital Library <noreply@digitallibrary.com>` |

> **How to get FIREBASE_CREDENTIALS_JSON:**
> Open PowerShell and run:
> ```powershell
> (Get-Content backend\firebase-credentials.json -Raw) | Set-Clipboard
> ```
> Then paste the clipboard value into the env var.

### 1.4 Note your backend URL
After deployment, copy the URL: `https://your-backend.vercel.app`

---

## Step 2 – Deploy the Frontend

### 2.1 Create a new Vercel project for the frontend
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the **same** GitHub repo
3. Set **Root Directory** to `frontend`
4. **Framework Preset**: **Vite**
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Click **Deploy**

### 2.2 Set Environment Variables (Frontend)
Go to your frontend Vercel project → **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.vercel.app` |

### 2.3 Update backend CORS
Go back to the **backend** Vercel project → Settings → Environment Variables.
Update `FRONTEND_URL` and `VERCEL_FRONTEND_URL` with your frontend URL, then **Redeploy**.

---

## Step 3 – Update Frontend API calls

Make sure your frontend uses `import.meta.env.VITE_API_URL` as the base URL:
```js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

---

## File Structure Summary

```
Digital Library SYSTEM/
├── backend/                    ← Deploy as Vercel project (Root Dir = backend/)
│   ├── vercel.json             ← Backend serverless config ✅
│   ├── build_files.sh          ← Build script for Vercel ✅
│   ├── requirements.txt        ← Python dependencies ✅
│   ├── .env.vercel.example     ← Reference for Vercel env vars ✅
│   ├── library_system/
│   │   ├── settings.py         ← Production-ready settings ✅
│   │   └── wsgi.py
│   └── api/
├── frontend/                   ← Deploy as Vercel project (Root Dir = frontend/)
│   ├── vercel.json             ← SPA routing catch-all ✅
│   ├── vite.config.js          ← Build config ✅
│   └── .env.production         ← Fill in VITE_API_URL ✅
└── vercel.json                 ← Root placeholder (not used) ✅
```

---

## Common Issues

| Issue | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'mysqlclient'` | Add `mysqlclient` to requirements.txt (already done) |
| Firebase auth fails | Check `FIREBASE_CREDENTIALS_JSON` is valid JSON (no extra whitespace) |
| React routes 404 on refresh | `frontend/vercel.json` rewrites handle this (already done) |
| CORS errors | Ensure `FRONTEND_URL` env var matches your frontend domain exactly |
