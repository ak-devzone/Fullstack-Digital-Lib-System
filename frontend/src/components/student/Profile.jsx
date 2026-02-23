import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../utils/constants';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Button,
    Divider,
    Alert,
    CircularProgress,
    Chip,
    Avatar
} from '@mui/material';
import { CloudUpload, CheckCircle, Warning, Person, ArrowBack } from '@mui/icons-material';

const Profile = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUserData();
    }, [currentUser]);

    const fetchUserData = async () => {
        if (currentUser) {
            try {
                const token = await currentUser.getIdToken();
                const response = await fetch(`${API_URL}/admin/users/${currentUser.uid}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setUserData(data.user);
                    }
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // File size validation (512KB max)
            const maxSize = 512 * 1024; // 512KB in bytes
            if (selectedFile.size > maxSize) {
                setError(`File size not proper. Maximum allowed size is 512KB. Your file is ${(selectedFile.size / 1024).toFixed(1)}KB.`);
                setFile(null);
                e.target.value = ''; // Clear input
                return;
            }

            // File format validation (PDF, JPG, JPEG only)
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            const allowedExtensions = ['pdf', 'jpg', 'jpeg'];

            if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
                setError(`File format not proper. Only PDF, JPG, and JPEG files are allowed.`);
                setFile(null);
                e.target.value = ''; // Clear input
                return;
            }

            setFile(selectedFile);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file || !userData) return;

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userData.userId); // Ensure this matches what backend expects (Student ID)

            const response = await fetch(`${API_URL}/upload-id-proof/`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Upload failed');
            }

            const result = await response.json();

            setSuccess('ID Proof uploaded successfully!');
            setFile(null);
            fetchUserData(); // Refresh data immediately

            // Redirect back if returnUrl exists
            if (location.state?.returnUrl) {
                setTimeout(() => navigate(location.state.returnUrl), 1500);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to upload proof');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            py: 4
        }}>
            <Container maxWidth="md">
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => window.history.back()}
                    sx={{ color: 'white', mb: 3, opacity: 0.8 }}
                >
                    Back to Dashboard
                </Button>

                <Paper elevation={0} sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    bgcolor: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
                }}>
                    <Box display="flex" alignItems="center" mb={4} flexDirection={{ xs: 'column', sm: 'row' }} textAlign={{ xs: 'center', sm: 'left' }}>
                        <Avatar sx={{
                            width: 100,
                            height: 100,
                            bgcolor: 'transparent',
                            border: '3px solid #ec4899',
                            color: '#ec4899',
                            fontSize: 40,
                            fontWeight: 'bold',
                            mr: { xs: 0, sm: 3 },
                            mb: { xs: 2, sm: 0 },
                            boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
                        }}>
                            {userData?.name?.charAt(0) || <Person />}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {userData?.name}
                            </Typography>
                            <Box display="flex" gap={1} justifyContent={{ xs: 'center', sm: 'flex-start' }} flexWrap="wrap" mt={1}>
                                <Chip
                                    label={userData?.role?.toUpperCase()}
                                    sx={{
                                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                                        color: '#818cf8',
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                        fontWeight: 600
                                    }}
                                    size="small"
                                />
                                <Chip
                                    label={userData?.department}
                                    sx={{
                                        bgcolor: 'rgba(236, 72, 153, 0.1)',
                                        color: '#f472b6',
                                        border: '1px solid rgba(236, 72, 153, 0.2)',
                                        fontWeight: 600
                                    }}
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>Email Address</Typography>
                                <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>{userData?.email}</Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>Student ID</Typography>
                                <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>{userData?.userId}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>Department Code</Typography>
                                <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>{userData?.department}</Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box
                                p={3}
                                borderRadius={3}
                                sx={{
                                    bgcolor: userData?.idProofVerified
                                        ? 'rgba(34, 197, 94, 0.1)'
                                        : userData?.idProofRejectionReason
                                            ? 'rgba(239, 68, 68, 0.1)'
                                            : 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid',
                                    borderColor: userData?.idProofVerified
                                        ? 'rgba(34, 197, 94, 0.3)'
                                        : userData?.idProofRejectionReason
                                            ? 'rgba(239, 68, 68, 0.3)'
                                            : 'rgba(245, 158, 11, 0.3)'
                                }}
                            >
                                <Typography variant="h6" gutterBottom display="flex" alignItems="center" sx={{ color: 'white', fontWeight: 600 }}>
                                    ID Proof Status
                                    {userData?.idProofVerified ?
                                        <CheckCircle color="success" sx={{ ml: 1 }} /> :
                                        userData?.idProofRejectionReason ?
                                            <Warning color="error" sx={{ ml: 1 }} /> :
                                            <Warning color="warning" sx={{ ml: 1 }} />
                                    }
                                </Typography>

                                {userData?.idProofVerified ? (
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#4ade80', mb: 2, display: 'flex', alignItems: 'center' }}>
                                            <CheckCircle sx={{ mr: 1, fontSize: 20 }} />
                                            Verified & Approved
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            href={userData.idProofUrl}
                                            target="_blank"
                                            sx={{
                                                color: '#4ade80',
                                                borderColor: '#4ade80',
                                                '&:hover': {
                                                    borderColor: '#22c55e',
                                                    bgcolor: 'rgba(34, 197, 94, 0.1)'
                                                }
                                            }}
                                        >
                                            View Verified Proof
                                        </Button>
                                    </Box>
                                ) : userData?.idProofUrl && !userData?.idProofRejectionReason ? (
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#fbbf24', mb: 2, display: 'flex', alignItems: 'center' }}>
                                            <Warning sx={{ mr: 1, fontSize: 20 }} />
                                            Verification Pending
                                        </Typography>
                                        <Alert severity="warning" variant="filled" sx={{ mb: 2, borderRadius: 2 }}>
                                            Your ID proof has been uploaded and is waiting for admin verification.
                                        </Alert>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            href={userData.idProofUrl}
                                            target="_blank"
                                            sx={{
                                                color: '#fbbf24',
                                                borderColor: '#fbbf24',
                                                '&:hover': {
                                                    borderColor: '#f59e0b',
                                                    bgcolor: 'rgba(245, 158, 11, 0.1)'
                                                }
                                            }}
                                        >
                                            View Uploaded Proof
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box>
                                        {userData?.idProofRejectionReason && (
                                            <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 2 }}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    ID Proof Rejected
                                                </Typography>
                                                Reason: {userData.idProofRejectionReason}
                                                <Box mt={1}>Please upload a clear copy of your ID proof again.</Box>
                                            </Alert>
                                        )}

                                        {!userData?.idProofRejectionReason && (
                                            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                                                Please upload your College ID Proof to complete your profile verification.
                                            </Typography>
                                        )}

                                        {error && (
                                            <Alert severity="error" variant="filled" sx={{ mb: 2, borderRadius: 2 }}>
                                                {error}
                                            </Alert>
                                        )}
                                        {success && (
                                            <Alert severity="success" variant="filled" sx={{ mb: 2, borderRadius: 2 }}>
                                                {success}
                                            </Alert>
                                        )}

                                        <Button
                                            component="label"
                                            variant="outlined"
                                            startIcon={<CloudUpload />}
                                            fullWidth
                                            sx={{
                                                mb: 2,
                                                color: 'white',
                                                borderColor: 'rgba(255,255,255,0.3)',
                                                '&:hover': {
                                                    borderColor: 'white',
                                                    bgcolor: 'rgba(255,255,255,0.05)'
                                                }
                                            }}
                                        >
                                            {file ? file.name : 'Select File (PDF/JPG)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                                                onChange={handleFileChange}
                                            />
                                        </Button>

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            disabled={!file || uploading}
                                            onClick={handleUpload}
                                            sx={{
                                                background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                '&:disabled': {
                                                    opacity: 0.5,
                                                    color: 'rgba(255,255,255,0.5)'
                                                }
                                            }}
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Proof'}
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};

export default Profile;
