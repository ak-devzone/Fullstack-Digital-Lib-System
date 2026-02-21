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
    Menu,
    MenuItem,
    Avatar
} from '@mui/material';
import {
    LocalLibrary,
    Brightness4,
    Brightness7,
    Person,
    Search
} from '@mui/icons-material';

const StudentLayout = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleMenuClose();
        await logout();
        navigate('/login');
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: darkMode
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : '#f8fafc',
            pb: 4,
            transition: 'all 0.3s ease'
        }}>
            {/* Shared AppBar */}
            <AppBar
                position="sticky"
                elevation={darkMode ? 0 : 1}
                sx={{
                    backdropFilter: 'blur(20px)',
                    backgroundColor: darkMode
                        ? 'rgba(15, 23, 42, 0.7)'
                        : 'rgba(255, 255, 255, 0.8)',
                    borderBottom: darkMode
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: darkMode
                        ? '0 4px 30px rgba(0, 0, 0, 0.1)'
                        : '0 4px 6px -1px rgba(0,0,0,0.1)',
                    color: darkMode ? 'white' : 'text.primary',
                    mb: 4
                }}
            >
                <Toolbar>
                    <LocalLibrary sx={{ mr: 2, color: '#4f46e5' }} />
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 'bold',
                            background: 'linear-gradient(to right, #4f46e5, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/dashboard')}
                    >
                        Digital Library
                    </Typography>

                    <IconButton
                        onClick={() => navigate('/search')}
                        sx={{ color: darkMode ? 'white' : 'text.primary', mr: 1 }}
                        title="Search Books"
                    >
                        <Search />
                    </IconButton>

                    <IconButton onClick={toggleTheme} sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>

                    <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
                        <Avatar sx={{
                            bgcolor: 'transparent',
                            border: '2px solid #ec4899',
                            color: '#ec4899',
                            fontWeight: 'bold',
                            width: 40,
                            height: 40
                        }}>
                            {currentUser?.displayName?.charAt(0) || 'S'}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'white',
                                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                                color: darkMode ? 'white' : 'text.primary',
                                '& .MuiMenuItem-root': {
                                    '&:hover': { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)' }
                                }
                            }
                        }}
                    >
                        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Render Child Component */}
            <Outlet context={{ darkMode }} />
        </Box>
    );
};

export default StudentLayout;
