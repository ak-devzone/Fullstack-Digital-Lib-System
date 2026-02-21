import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../utils/firebase';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    InputAdornment,
    IconButton,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    AdminPanelSettings
} from '@mui/icons-material';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, currentUser, userRole } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const currentDateTime = new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // login function now handles admin verification via 'admin' role param
            const user = await login(formData.email, formData.password, 'admin');

            // Proceed to dashboard
            if (user) {
                navigate('/admin/dashboard');
            }

        } catch (error) {
            console.error(error);
            setError(error.message || 'Failed to login. Please check your admin credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 30%, rgba(220, 38, 38, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(79, 70, 229, 0.4) 0%, transparent 50%)',
                    filter: 'blur(60px)',
                    zIndex: 0
                }
            }}
        >
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Paper
                    elevation={24}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        borderRadius: 4,
                        backdropFilter: 'blur(20px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <AdminPanelSettings sx={{ fontSize: 60, color: '#dc2626', mb: 2 }} />
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(to right, #dc2626, #ea580c)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                                letterSpacing: -1
                            }}
                        >
                            Admin Access
                        </Typography>
                        <Typography
                            variant="body1"
                            color="textSecondary"
                        >
                            Secure area for library management
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                mt: 2,
                                color: '#64748b',
                                bgcolor: '#f1f5f9',
                                py: 0.5,
                                px: 2,
                                borderRadius: 10,
                                display: 'inline-block'
                            }}
                        >
                            {currentDateTime}
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Admin Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            sx={{ mb: 2 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                sx: { borderRadius: 2 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: '1rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
                                boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.4)',
                                '&:hover': {
                                    boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.5)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? 'Logging in...' : 'Admin Login'}
                        </Button>
                    </form>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Link
                            to="/admin/"
                            style={{
                                color: '#dc2626',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}
                        >

                        </Link>
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Link
                            to="/login"
                            style={{
                                color: '#64748b',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}
                        >
                            ← Back to Student Login
                        </Link>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AdminLogin;
