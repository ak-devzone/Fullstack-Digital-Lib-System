import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DEPARTMENTS } from '../../utils/constants';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    MenuItem
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const CompleteProfile = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        mobile: '',
        department: ''
    });
    const [idProof, setIdProof] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if profile is already complete
        const checkProfile = async () => {
            if (currentUser) {
                try {
                    const response = await fetch(`http://localhost:8000/api/admin/users/${currentUser.uid}/`, {
                        headers: {
                            'Authorization': `Bearer ${await currentUser.getIdToken()}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.user.department) {
                            // Profile already complete
                            navigate('/dashboard');
                        }
                    }
                } catch (error) {
                    console.error("Error checking profile:", error);
                }
            }
        };
        checkProfile();
    }, [currentUser, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type.includes('pdf') || file.type.includes('image'))) {
            setIdProof(file);
        } else {
            setError('Please upload a valid PDF or image file');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.department) {
            return setError('Please select a department');
        }

        if (!idProof) {
            return setError('Please upload your ID proof');
        }

        setLoading(true);

        try {
            const token = await currentUser.getIdToken();
            const submitData = new FormData();
            submitData.append('mobile', formData.mobile);
            submitData.append('department', formData.department);
            submitData.append('idProof', idProof);

            const response = await fetch('http://localhost:8000/api/users/profile/complete/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to complete profile');
            }

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error) {
            setError(error.message || 'Failed to update profile');
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
                py: 4
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
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: '#764ba2' }}
                    >
                        📝 Complete Your Profile
                    </Typography>

                    <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
                        Welcome! Please provide additional information to complete your registration.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
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
                        >
                            {DEPARTMENTS.map((dept) => (
                                <MenuItem key={dept.code} value={dept.code}>
                                    {dept.name} ({dept.code})
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ mt: 2, mb: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                                Upload ID Proof (PDF or Image) *
                            </Typography>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                sx={{ mt: 1 }}
                            >
                                {idProof ? idProof.name : 'Choose File'}
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                            </Button>
                        </Box>

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
                            {loading ? 'Completing Profile...' : 'Complete Profile'}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default CompleteProfile;
