import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';

// Landing Page
import LandingPage from './components/landing/LandingPage';

// Authentication Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import AdminLogin from './components/auth/AdminLogin';
import AdminRegister from './components/auth/AdminRegister';
import CompleteProfile from './components/auth/CompleteProfile';

// Student Components
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './components/student/Dashboard';
import BookList from './components/student/BookList';
import BookReader from './components/student/BookReader';
import Search from './components/student/Search';
import Profile from './components/student/Profile';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import DepartmentManagement from './components/admin/DepartmentManagement';
import BookManagement from './components/admin/BookManagement';
import UserManagement from './components/admin/UserManagement';
import Analytics from './components/admin/Analytics';
import Reports from './components/admin/Reports';

// Shared Components
import ProtectedRoute from './components/shared/ProtectedRoute';

function App() {
    return (
        <ThemeContextProvider>
            <AuthProvider>
                <Router>
                    <CssBaseline />
                    <Routes>
                        {/* Landing Page */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/register" element={<AdminRegister />} />
                        <Route path="/complete-profile" element={<CompleteProfile />} />

                        {/* Student Routes */}
                        {/* Student Routes */}
                        <Route element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
                            <Route path="/dashboard" element={<StudentDashboard />} />
                            <Route path="/books/:department/:semester" element={<BookList />} />
                            <Route path="/book/:id" element={<BookReader />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/analytics" element={<Analytics />} />
                            <Route path="/admin/departments" element={<DepartmentManagement />} />
                            <Route path="/admin/books" element={<BookManagement />} />
                            <Route path="/admin/users" element={<UserManagement />} />
                            <Route path="/admin/reports" element={<Reports />} />
                        </Route>

                        {/* Default Route */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeContextProvider>
    );
}

export default App;
