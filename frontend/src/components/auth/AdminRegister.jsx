import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ADMIN_SECRET_KEY } from '../../utils/constants';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    AdminPanelSettings,
    Key,
    CheckCircle
} from '@mui/icons-material';

const AdminRegister = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successDialog, setSuccessDialog] = useState(false);

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

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Please enter your email');
            return false;
        }
        if (!formData.secretKey.trim()) {
            setError('Please enter the admin secret key');
            return false;
        }
        if (formData.secretKey !== ADMIN_SECRET_KEY) {
            setError('Invalid admin secret key. Contact administrator for access.');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Register admin with role in Firebase (optional, already done via signup)
            const user = await signup(formData.email, formData.password, {
                name: formData.name,
                role: 'admin',
                createdAt: new Date().toISOString()
            });

            // CREATE ADMIN IN MYSQL
            const token = await user.getIdToken();
            const registerResponse = await fetch('http://localhost:8000/api/admin/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    secretKey: formData.secretKey
                })
            });

            if (!registerResponse.ok) {
                const errorData = await registerResponse.json();
                throw new Error(errorData.error || 'Failed to create backend admin profile');
            }

            // Send welcome email
            try {
                await fetch('http://localhost:8000/api/send-admin-welcome/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email
                    })
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't block registration if email fails
            }

            // Show success dialog
            setSuccessDialog(true);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setError('This email is already registered');
            } else if (error.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else if (error.code === 'auth/weak-password') {
                setError('Password is too weak');
            } else {
                setError('Failed to create admin account. Please try again.');
            }
            console.error(error);
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <AdminPanelSettings sx={{ fontSize: 60, color: '#764ba2' }} />
                    </Box>

                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: '#764ba2' }}
                    >
                        Admin Registration
                    </Typography>

                    <Typography
                        variant="body2"
                        align="center"
                        color="textSecondary"
                        sx={{ mb: 3 }}
                    >
                        {currentDateTime}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            label="Admin Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            label="Admin Secret Key"
                            name="secretKey"
                            type="password"
                            value={formData.secretKey}
                            onChange={handleChange}
                            margin="normal"
                            required
                            helperText="Contact administrator for the secret key"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Key sx={{ color: '#764ba2' }} />
                                    </InputAdornment>
                                )
                            }}
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
                            helperText="Minimum 6 characters"
                            InputProps={{
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

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            margin="normal"
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? 'Creating Account...' : 'Create Admin Account'}
                        </Button>
                    </form>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Link
                            to="/admin/login"
                            style={{
                                color: '#764ba2',
                                textDecoration: 'none',
                                fontSize: '0.875rem'
                            }}
                        >
                            Already have an account? Login
                        </Link>
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                        <Link
                            to="/login"
                            style={{
                                color: '#999',
                                textDecoration: 'none',
                                fontSize: '0.875rem'
                            }}
                        >
                            ← Back to Student Login
                        </Link>
                    </Box>
                </Paper>

                {/* Success Dialog */}
                <Dialog
                    open={successDialog}
                    onClose={() => { }}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            textAlign: 'center',
                            p: 2
                        }
                    }}
                >
                    <DialogContent>
                        <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#764ba2' }}>
                            Registration Successful!
                        </Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                            Your admin account has been created successfully.
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            A welcome email has been sent to <strong>{formData.email}</strong>
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/admin/login')}
                            sx={{
                                px: 4,
                                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                fontWeight: 'bold'
                            }}
                        >
                            Go to Login
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default AdminRegister;
