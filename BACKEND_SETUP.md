# Django Backend Setup Guide

## 📋 Prerequisites

Before running the Django backend, you need:
- Python 3.9 or higher installed
- Firebase Admin SDK credentials

---

## 🔥 Step 1: Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **library-systemm**
3. Click the **gear icon** → **Project settings**
4. Go to **"Service accounts"** tab
5. Click **"Generate new private key"**
6. Download the JSON file
7. Rename it to `firebase-credentials.json`
8. Place it in the `backend` folder

---

## 🐍 Step 2: Create Virtual Environment

```powershell
# Navigate to backend folder
cd "d:\html\Digital Library SYSTEM\backend"

# Create virtual environment
python -m venv venv

# Activate it (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# If you get execution policy error:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

## 📦 Step 3: Install Dependencies

```powershell
# Make sure virtual environment is activated (you'll see "(venv)" in prompt)
pip install -r requirements.txt
```

This will install:
- Django
- Django REST Framework
- Firebase Admin SDK
- CORS headers
- And more...

---

## ⚙️ Step 4: Configure Environment

```powershell
# Copy the example env file
copy .env.example .env

# Edit .env file (you can use notepad)
notepad .env
```

Make sure these are set:
```
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
SECRET_KEY=your-secret-key-here-change-this
DEBUG=True
FRONTEND_URL=http://localhost:3000
```

---

## 🗄️ Step 5: Run Migrations

```powershell
# Create database tables (using SQLite for now)
python manage.py migrate
```

You should see output like:
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
```

---

## 👤 Step 6: Create Django Admin User (Optional)

```powershell
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

---

## 🚀 Step 7: Run the Django Server

```powershell
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

---

## ✅ Step 8: Test the Backend

Open your browser and go to:
- http://localhost:8000/api/health/

You should see:
```json
{"status": "ok"}
```

---

## 🎯 What's Next?

The backend is now ready! It provides:
- ✅ REST API endpoints at `/api/`
- ✅ Django admin at `/admin/` (if you created superuser)
- ✅ Firebase authentication middleware
- ✅ CORS configured for frontend

The backend currently has minimal endpoints. More will be added as you build features like:
- Book management
- User analytics
- AI integration

---

## 🐛 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'django'"
**Solution:** Make sure virtual environment is activated:
```powershell
.\venv\Scripts\Activate.ps1
```

### Error: "firebase_admin not found"
**Solution:** Install requirements again:
```powershell
pip install -r requirements.txt
```

### Error: "Firebase credentials file not found"
**Solution:** Make sure `firebase-credentials.json` is in the backend folder

---

## 📂 Backend Structure

```
backend/
├── library_system/          # Django project
│   ├── settings.py          # Main configuration
│   ├── urls.py              # URL routing
│   ├── wsgi.py              # WSGI config
│   └── asgi.py              # ASGI config
├── api/                     # API app
│   ├── urls.py              # API routes
│   ├── middleware.py        # Firebase auth
│   └── views.py             # API views (to be added)
├── manage.py                # Django management
├── requirements.txt         # Python packages
├── .env                     # Environment variables
└── firebase-credentials.json # Firebase admin key
```

---

## ⚡ Running Both Frontend & Backend Together

### Terminal 1 - Frontend:
```powershell
cd "d:\html\Digital Library SYSTEM\frontend"
npm run dev
# Runs at: http://localhost:3000
```

### Terminal 2 - Backend:
```powershell
cd "d:\html\Digital Library SYSTEM\backend"
.\venv\Scripts\Activate.ps1
python manage.py runserver
# Runs at: http://localhost:8000
```

Now your complete stack is running! 🚀
