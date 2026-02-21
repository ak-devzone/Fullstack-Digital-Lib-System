import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            return setError('Please enter your email address');
        }

        try {
            setMessage('');
            setError('');
            setLoading(true);

            // Call our custom backend instead of direct Firebase reset
            const response = await fetch('http://localhost:8000/api/send-password-reset-email/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 404) {
                    throw new Error('This email is not registered with the Digital Library System.');
                }
                throw new Error(errorData.error || 'Failed to send reset email');
            }

            setMessage('Check your inbox for password reset instructions');
        } catch (error) {
            console.error(error);
            setError(error.message || 'Failed to reset password. Please check the email address.');
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
                    <Box sx={{ mb: 3 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/login')}
                            sx={{ color: '#764ba2' }}
                        >
                            Back to Login
                        </Button>
                    </Box>

                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: '#764ba2' }}
                    >
                        Reset Password
                    </Typography>

                    <Typography
                        variant="body1"
                        align="center"
                        color="textSecondary"
                        sx={{ mb: 3 }}
                    >
                        Enter your email address and we'll send you a link to reset your password.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {message && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {message}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                        </Button>
                    </form>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2">
                            Need an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    color: '#764ba2',
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                }}
                            >
                                Register here
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ForgotPassword;
