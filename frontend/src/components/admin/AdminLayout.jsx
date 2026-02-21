import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Button
} from '@mui/material';
import {
    TrendingUp,
    Logout,
    Brightness4,
    Brightness7
} from '@mui/icons-material';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: darkMode
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : '#f3f4f6',
            pb: 4,
            transition: 'all 0.3s ease'
        }}>
            {/* Shared AppBar */}
            <AppBar
                position="sticky"
                sx={{
                    backdropFilter: 'blur(20px)',
                    backgroundColor: darkMode
                        ? 'rgba(15, 23, 42, 0.7)'
                        : 'rgba(255, 255, 255, 0.8)',
                    borderBottom: darkMode
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: darkMode
                        ? '0 4px 30px rgba(0, 0, 0, 0.1)'
                        : '0 4px 30px rgba(0, 0, 0, 0.05)',
                    color: darkMode ? 'white' : 'text.primary',
                    mb: 4
                }}
            >
                <Toolbar>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(239, 68, 68, 0.1)',
                        p: 1,
                        borderRadius: 2,
                        mr: 2
                    }}>
                        <TrendingUp sx={{ color: '#ef4444' }} />
                    </Box>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 'bold',
                            background: 'linear-gradient(to right, #ef4444, #f59e0b)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        Admin Dashboard
                    </Typography>

                    {/* Navigation Menu */}
                    <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                        <Button
                            onClick={() => navigate('/admin/dashboard')}
                            sx={{
                                color: darkMode ? 'white' : 'text.primary',
                                fontWeight: 600,
                                '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                            }}
                        >
                            Dashboard
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/analytics')}
                            sx={{
                                color: darkMode ? 'white' : 'text.primary',
                                fontWeight: 600,
                                '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                            }}
                        >
                            Analytics
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/books')}
                            sx={{
                                color: darkMode ? 'white' : 'text.primary',
                                fontWeight: 600,
                                '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                            }}
                        >
                            Books
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/users')}
                            sx={{
                                color: darkMode ? 'white' : 'text.primary',
                                fontWeight: 600,
                                '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                            }}
                        >
                            Users
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/reports')}
                            sx={{
                                color: darkMode ? 'white' : 'text.primary',
                                fontWeight: 600,
                                '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                            }}
                        >
                            Reports
                        </Button>
                    </Box>

                    <IconButton onClick={toggleTheme} sx={{ color: darkMode ? 'white' : 'text.primary', mr: 1 }}>
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>

                    <Button
                        onClick={handleLogout}
                        startIcon={<Logout />}
                        sx={{
                            color: '#ef4444',
                            fontWeight: 'bold',
                            '&:hover': {
                                bgcolor: 'rgba(239, 68, 68, 0.1)'
                            }
                        }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Render Child Component */}
            <Outlet context={{ darkMode }} />
        </Box>
    );
};

export default AdminLayout;
