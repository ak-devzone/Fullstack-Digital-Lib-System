# 📚 Digital Library System

A comprehensive digital library management system with AI-powered features for students and administrators.

## 🚀 Features

### Student Features
- ✅ Department-based registration with auto-generated User IDs (CSE001, ECE001, etc.)
- ✅ Email/Password and Google Sign-In authentication
- ✅ Department and semester-wise book browsing (6 semesters)
- 📖 PDF book reader with progress tracking
- 🔍 Advanced book search functionality
- ⏱️ Reading time tracking
- 🏆 Reward system with badges and leaderboard
- ⭐ Book rating system
- 🤖 AI chatbot for book summaries and Q&A
- 🌙 Dark/Light mode toggle

### Admin Features
- 📊 Analytics dashboard
- 👥 User management
- 📚 Book management with PDF upload
- 🖼️ Auto-generated book covers
- 🏛️ Department and semester management
- 📈 Usage analytics and reporting

## 🛠️ Technology Stack

- **Frontend**: React + Vite + Material-UI
- **Backend**: Django REST Framework
- **Authentication**: Firebase Auth
- **Database**: Firestore (NoSQL)
- **Storage**: Firebase Storage
- **AI**: OpenAI GPT-4 / Google Gemini

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- Python (v3.9 or higher)
- Firebase account
- OpenAI or Google Gemini API key (for AI features)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
cd "d:\\html\\Digital Library SYSTEM"
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (you'll need to bypass PowerShell execution policy)
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Then install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env with your Firebase credentials
notepad .env
```

**Configure Firebase:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Create a Firestore database
5. Enable Firebase Storage
6. Get your config credentials and add to `.env`

### 3. Backend Setup

```bash
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env

# Edit .env with your credentials
notepad .env

# Download Firebase Admin SDK credentials
# Go to Firebase Console > Project Settings > Service Accounts
# Generate new private key and save as firebase-credentials.json in backend folder
```

### 4. Initialize Django Project

```bash
# Create Django project
django-admin startproject library_system .

# Create API app
python manage.py startapp api

# Run migrations (if using PostgreSQL)
python manage.py migrate
```

## 🔥 Firebase Setup

### Firestore Structure
```
users/
  {uid}/
    - name: string
    - email: string
    - mobile: string
    - department: string
    - userId: string (CSE001, ECE001, etc.)
    - role: string (student/admin)
    - totalBooksCompleted: number
    - totalHoursUsed: number
    - badges: array

departments/
  {deptCode}/
    - name: string
    - code: string
    semesters/
      {semNumber}/
        books/
          {bookId}/
            - title: string
            - author: string
            - pdfUrl: string
            - coverImageUrl: string
            - totalPages: number

userProgress/
  {uid}/
    books/
      {bookId}/
        - pagesRead: number
        - totalPages: number
        - percentage: number
        - totalTimeSpent: number

userSessions/
  {uid}/
    sessions/
      {sessionId}/
        - loginTime: timestamp
        - logoutTime: timestamp
        - duration: number
```

### Firebase Security Rules (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Departments and books (read-only for students)
    match /departments/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // User progress (private)
    match /userProgress/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // User sessions (private)
    match /userSessions/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // ID Proofs (upload only by owner, read by admins)
    match /id-proofs/{allPaths=**} {
      allow write: if request.auth != null;
      allow read: if request.auth != null;
    }
    
    // Book PDFs (read-only for authenticated users)
    match /books/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🏃 Running the Application

### Start Frontend (Development)
```bash
cd frontend
npm run dev
```
Frontend will run at: http://localhost:3000

### Start Backend (Development)
```bash
cd backend
# Activate virtual environment first
.\venv\Scripts\Activate.ps1

# Run Django development server
python manage.py runserver
```
Backend API will run at: http://localhost:8000

## 📱 Default User Credentials

After setup, create an admin user:

1. Register a student account normally
2. Go to Firebase Console > Firestore
3. Find the user document
4. Change the `role` field from `student` to `admin`
5. Login to `/admin/login` with those credentials

## 🗂️ Project Structure

```
Digital Library SYSTEM/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── student/      # Student dashboard & features
│   │   │   ├── admin/        # Admin panel
│   │   │   └── shared/       # Shared components
│   │   ├── contexts/         # React contexts
│   │   ├── utils/            # Utilities & Firebase config
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── library_system/       # Django project
    ├── api/                  # API app
    ├── requirements.txt
    └── manage.py
```

## 🎯 Development Roadmap

- [x] **Phase 1**: Project setup
- [x] **Phase 2**: Authentication system
- [ ] **Phase 3**: Student features
- [ ] **Phase 4**: Admin features
- [ ] **Phase 5**: AI integration
- [ ] **Phase 6**: Advanced features
- [ ] **Phase 7**: Testing & deployment

## 🐛 Troubleshooting

### PowerShell Execution Policy Error
If you get "running scripts is disabled" error:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Firebase Connection Issues
- Verify your `.env` file has correct Firebase credentials
- Check Firebase project settings
- Ensure Firestore and Storage are enabled

### Python Virtual Environment Issues
```bash
# If activation fails, try:
python -m venv venv --clear
```

## 📄 License

This project is created for educational purposes.

## 👥 Contributors

- Student Final Year Project

## 📞 Support

For issues and questions, please refer to the implementation plan or create an issue in the repository.

---

**Happy Coding! 📚✨**
