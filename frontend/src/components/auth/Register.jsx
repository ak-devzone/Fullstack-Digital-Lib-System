import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { DEPARTMENTS, API_URL } from '../../utils/constants';
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
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    CloudUpload
} from '@mui/icons-material';

const Register = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobile: '',
        department: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState('Create Account');
    const [successDialog, setSuccessDialog] = useState(false);
    const [generatedUserId, setGeneratedUserId] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);

        try {
            setStatusText('Creating Account...');

            // 1. Create Authentication User first (to get permissions)
            let userCredential;
            try {
                userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            } catch (authError) {
                if (authError.code === 'auth/email-already-in-use') {
                    throw new Error('Email is already registered. Please login.');
                }
                throw authError; // Re-throw other errors
            }

            const user = userCredential.user;
            console.log('User created:', user.uid);

            setStatusText('Registering Profile...');

            // 2. Register User via Backend API (Generates ID and creates profile)
            const token = await user.getIdToken();
            const response = await fetch(`${API_URL}/users/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    department: formData.department
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register profile.');
            }

            if (data.success) {
                const userId = data.user.userId;
                console.log('ID Generated:', userId);

                setStatusText('Sending Email...');

                // 3. Send welcome email via backend (Non-blocking)
                try {
                    const emailResponse = await fetch(`${API_URL}/send-welcome-email/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: formData.email,
                            name: formData.name,
                            user_id: userId,
                            department: formData.department
                        }),
                    });

                    if (!emailResponse.ok) {
                        const errorData = await emailResponse.json();
                        console.error("Email send error:", errorData);
                        // Alerting for visibility during debugging
                        alert(`Warning: Email sending failed. ${errorData.error || 'Check backend logs.'}`);
                    }
                } catch (err) {
                    console.error("Email send network error:", err);
                }

                // Show success dialog with generated user ID
                setGeneratedUserId(userId);
                setSuccessDialog(true);
                setFormData({ ...formData, password: '', confirmPassword: '' }); // Clear sensitive data
            } else {
                throw new Error(data.error || 'Registration failed.');
            }

        } catch (error) {
            setError(error.message || 'Failed to create account');
            console.error(error);
        } finally {
            setLoading(false);
            setStatusText('Create Account');
        }
    };

    const handleDialogClose = () => {
        setSuccessDialog(false);
        navigate('/dashboard');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                py: 4,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 30%, rgba(79, 70, 229, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
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
                    <Box textAlign="center" mb={4}>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(to right, #4f46e5, #ec4899)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                                letterSpacing: -1
                            }}
                        >
                            Join Digital Library
                        </Typography>
                        <Typography
                            variant="body1"
                            color="textSecondary"
                        >
                            Create your account to start learning
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
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                            sx={{ mb: 2 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />

                        <TextField
                            fullWidth
                            label="Email Address"
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
                            label="Mobile Number"
                            name="mobile"
                            type="tel"
                            value={formData.mobile}
                            onChange={handleChange}
                            margin="normal"
                            required
                            inputProps={{ pattern: '[0-9]{10}', maxLength: 10 }}
                            sx={{ mb: 2 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />

                        <TextField
                            fullWidth
                            select
                            label="Department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            margin="normal"
                            required
                            sx={{ mb: 2 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        >
                            {DEPARTMENTS.map((dept) => (
                                <MenuItem key={dept.code} value={dept.code}>
                                    {dept.name} ({dept.code})
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                            sx={{ mb: 2 }}
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

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            margin="normal"
                            required
                            sx={{ mb: 3 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />

                        <Button
                            id="register-submit-btn"
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
                                background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)',
                                '&:hover': {
                                    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.5)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? statusText : 'Create Account'}
                        </Button>
                    </form>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: '#4f46e5',
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                }}
                            >
                                Login here
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>

            {/* Success Dialog */}
            <Dialog
                open={successDialog}
                onClose={handleDialogClose}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', color: '#1e293b', fontWeight: 800 }}>
                    🎉 Registration Successful!
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" align="center" gutterBottom color="textSecondary">
                        Your account has been created successfully.
                    </Typography>
                    <Box
                        sx={{
                            mt: 3,
                            p: 3,
                            backgroundColor: '#f8fafc',
                            borderRadius: 3,
                            textAlign: 'center',
                            border: '1px dashed #cbd5e1'
                        }}
                    >
                        <Typography variant="body2" color="muted" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>
                            Your Student ID
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(to right, #4f46e5, #ec4899)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {generatedUserId}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 3, textAlign: 'center' }}>
                        Please save this ID for future reference. A confirmation email has been sent to your registered email address.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        onClick={handleDialogClose}
                        variant="contained"
                        size="large"
                        sx={{
                            px: 4,
                            borderRadius: '50px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                            fontWeight: 700
                        }}
                    >
                        Continue to Dashboard
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Register;
