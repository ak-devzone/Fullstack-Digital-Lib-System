# 🔧 Registration Problem - Troubleshooting Guide

## Common Registration Issues & Fixes

### ❌ Problem 1: "FirebaseError: Firebase: Error (auth/...)"

**This means Firebase Authentication is not enabled yet.**

### ✅ Solution:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **library-systemm**
3. Click **"Authentication"** in the left menu
4. Click **"Get started"** if you see it
5. Go to **"Sign-in method"** tab
6. Enable these providers:
   - ✅ **Email/Password** (click, then toggle "Enable", Save)
   - ✅ **Google** (click, enable, add support email, Save)

---

### ❌ Problem 2: "FirebaseError: Missing or insufficient permissions"

**This means Firestore database doesn't exist or has wrong rules.**

### ✅ Solution:
1. In Firebase Console → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select region closest to you (e.g., asia-south1)
5. Click **"Enable"**

**Set Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

### ❌ Problem 3: "Storage: Error uploading file"

**Firebase Storage is not enabled.**

### ✅ Solution:
1. In Firebase Console → **"Storage"**
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Click **"Done"**

**Set Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

### ❌ Problem 4: Department User ID Not Generating

**Check the Register.jsx component logic.**

### ✅ Solution Already Implemented:
The `generateUserId` function in `Register.jsx` queries existing users and creates IDs like:
- CSE001, CSE002, etc.
- ECE001, ECE002, etc.

This should work once Firestore is enabled.

---

### ❌ Problem 5: ID Proof Upload Failing

**Make sure:**
1. ✅ Firebase Storage is enabled (see Problem 3)
2. ✅ File size is under 5MB
3. ✅ File type is PDF or Image (JPG, PNG)

---

## 🔄 After Fixing All Above Issues

### Test Registration Flow:
1. Open http://localhost:3000
2. Click **"Register here"**
3. Fill all fields:
   - Full Name
   - Email
   - Mobile (10 digits)
   - Select Department (e.g., CSE)
   - Password (min 6 chars)
   - Confirm Password
   - Upload ID Proof (PDF or image)
4. Click **"Register"**
5. You should see a popup with your User ID (e.g., **CSE001**)

---

## 🧪 Quick Test Commands

### Check if Firestore is accessible:
Open browser console on http://localhost:3000 and run:
```javascript
// This will be available after login
console.log('Firebase initialized:', firebase.apps.length > 0);
```

---

## 📝 Notes

- **User IDs are auto-generated** based on department (CSE001, ECE001, etc.)
- **Email will be sent** (once email service is configured in backend)
- **First user in each department** gets ID ending in 001
- **Test mode security rules** allow all authenticated users to read/write

---

## 🆘 Still Having Issues?

Check browser console (F12) for exact error messages and share them for specific help.
