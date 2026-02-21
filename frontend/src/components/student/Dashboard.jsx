import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../utils/firebase';
import { DEPARTMENTS, SEMESTERS, USER_ROLES } from '../../utils/constants';
import BookCard from './BookCard';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Chip,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress
} from '@mui/material';
import {
    Brightness4,
    Brightness7,
    Person,
    LocalLibrary,
    EmojiEvents,
    School,
    AccessTime,
    CalendarToday
} from '@mui/icons-material';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, logout, loginTime } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const [userData, setUserData] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(true);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch featured books
    useEffect(() => {
        const fetchFeaturedBooks = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/books/?featured=true');
                if (response.ok) {
                    const data = await response.json();

                    // If no featured books, fetch latest 6 books
                    if (!data.books || data.books.length === 0) {
                        const allBooksResponse = await fetch('http://localhost:8000/api/books/');
                        const allBooksData = await allBooksResponse.json();
                        setFeaturedBooks((allBooksData.books || []).slice(0, 4));
                    } else {
                        setFeaturedBooks(data.books || []);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch featured books:', error);
            } finally {
                setLoadingBooks(false);
            }
        };

        fetchFeaturedBooks();
    }, []);

    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    const response = await fetch(`http://localhost:8000/api/admin/users/${currentUser.uid}/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            const user = data.user;
                            const mappedUser = {
                                ...user,
                                userRole: user.role,
                            };
                            setUserData(mappedUser);

                            if (!mappedUser.role) {
                                setRoleDialogOpen(true);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user details in Dashboard", error);
                } finally {
                    setLoadingUser(false);
                }
            } else {
                setLoadingUser(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

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

    const handleDepartmentSelect = (semester) => {
        if (userData) {
            navigate(`/books/${userData.department}/${semester}`);
        }
    };

    const handleRoleSelect = async (roleValue) => {
        // Role update should be handled by backend or profile settings
        // For now, valid roles are set on creation. 
        // If we really need this, we'd need a backend endpoint.
        // Disabling this feature for now as it seems legacy prompt for role.
        // Or we can just update local state to close dialog.
        setUserData({ ...userData, userRole: roleValue });
        setRoleDialogOpen(false);
    };

    // Format session duration as HH:MM:SS
    const formatSessionDuration = () => {
        if (!loginTime) return '00:00:00';

        const duration = Math.floor((currentTime - loginTime) / 1000); // seconds
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Format current date and time
    const formatDateTime = () => {
        return currentTime.toLocaleString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loadingBooks || loadingUser) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {/* Main Content */}
                {/* Welcome Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 1 }}>
                        Welcome back, <span style={{ color: '#4f46e5' }}>{userData?.name?.split(' ')[0] || 'Student'}</span>! 👋
                    </Typography>
                    <Typography variant="body1" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 3 }}>
                        Track your progress and continue learning.
                    </Typography>

                    <Box display="flex" alignItems="center" gap={2} mb={4} flexWrap="wrap">
                        <Chip
                            icon={<School sx={{ color: 'white !important' }} />}
                            label={`${userData?.userId || ''} • ${userData?.department || ''}`}
                            sx={{
                                background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
                                color: 'white',
                                fontWeight: 600,
                                px: 1
                            }}
                        />
                        {userData?.userRole && (
                            <Chip
                                label={`${USER_ROLES.find(r => r.value === userData.userRole)?.icon || ''} ${USER_ROLES.find(r => r.value === userData.userRole)?.label || userData.userRole}`}
                                sx={{
                                    borderColor: '#ec4899',
                                    color: '#ec4899',
                                    fontWeight: 600,
                                    px: 1,
                                    background: 'rgba(236, 72, 153, 0.1)'
                                }}
                                variant="outlined"
                            />
                        )}
                    </Box>

                    {
                        userData?.idProofVerified === false && userData?.idProofRejectionReason && (
                            <Alert
                                severity="error"
                                variant="filled"
                                action={
                                    <Button color="inherit" size="small" onClick={() => navigate('/profile')} sx={{ fontWeight: 'bold' }}>
                                        Re-upload Now
                                    </Button>
                                }
                                sx={{
                                    mb: 4,
                                    borderRadius: 2,
                                    fontWeight: 500
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="bold">
                                    ID Proof Rejected
                                </Typography>
                                Reason: {userData.idProofRejectionReason}
                            </Alert>
                        )
                    }

                    {
                        !userData?.idProofUrl && (
                            <Alert
                                severity="warning"
                                variant="filled"
                                action={
                                    <Button color="inherit" size="small" onClick={() => navigate('/profile')} sx={{ fontWeight: 'bold' }}>
                                        Upload Now
                                    </Button>
                                }
                                sx={{
                                    mb: 4,
                                    borderRadius: 2,
                                    background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                                    color: 'white'
                                }}
                            >
                                Your profile is incomplete. Please upload your ID proof to unlock full access.
                            </Alert>
                        )
                    }
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {/* Session Timer Card */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                            color: 'white',
                            borderRadius: 4,
                            boxShadow: '0 10px 30px -10px rgba(79, 70, 229, 0.5)',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: -20,
                                right: -20,
                                opacity: 0.1,
                                transform: 'rotate(15deg)'
                            }}>
                                <AccessTime sx={{ fontSize: 180 }} />
                            </Box>
                            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                                <Box display="flex" alignItems="center" mb={3}>
                                    <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, mr: 2 }}>
                                        <CalendarToday sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>Current Session</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {formatDateTime()}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box mt={4}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>Session Duration</Typography>
                                    <Typography variant="h2" fontWeight="800" sx={{ textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                                        {formatSessionDuration()}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Grid container spacing={3} sx={{ height: '100%' }}>
                            <Grid item xs={6}>
                                <Card sx={{
                                    height: '100%',
                                    borderRadius: 4,
                                    bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                                    backdropFilter: darkMode ? 'blur(10px)' : 'none',
                                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                    boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <Box sx={{
                                            position: 'relative',
                                            display: 'inline-flex',
                                            mb: 2
                                        }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: 60,
                                                height: 60,
                                                bgcolor: 'rgba(79, 70, 229, 0.2)',
                                                borderRadius: '50%',
                                                filter: 'blur(10px)'
                                            }} />
                                            <LocalLibrary sx={{ fontSize: 40, color: '#6366f1', position: 'relative' }} />
                                        </Box>
                                        <Typography variant="h3" fontWeight="bold" sx={{ color: darkMode ? 'white' : 'text.primary', mb: 0.5 }}>
                                            {userData?.totalBooksCompleted || 0}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 500 }}>
                                            Books Completed
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={6}>
                                <Card sx={{
                                    height: '100%',
                                    borderRadius: 4,
                                    bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                                    backdropFilter: darkMode ? 'blur(10px)' : 'none',
                                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                    boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <Box sx={{
                                            position: 'relative',
                                            display: 'inline-flex',
                                            mb: 2
                                        }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: 60,
                                                height: 60,
                                                bgcolor: 'rgba(234, 179, 8, 0.2)',
                                                borderRadius: '50%',
                                                filter: 'blur(10px)'
                                            }} />
                                            <EmojiEvents sx={{ fontSize: 40, color: '#fbbf24', position: 'relative' }} />
                                        </Box>
                                        <Typography variant="h3" fontWeight="bold" sx={{ color: darkMode ? 'white' : 'text.primary', mb: 0.5 }}>
                                            {userData?.badges?.length || 0}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 500 }}>
                                            Badges Earned
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Department Section */}
                <Typography variant="h5" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 3 }}>
                    Browse <span style={{ color: '#ec4899' }}>{DEPARTMENTS.find(d => d.code === userData?.department)?.name}</span> Library
                </Typography>

                {/* Semesters Grid */}
                <Grid container spacing={2}>
                    {
                        SEMESTERS.map((sem) => (
                            <Grid item xs={6} sm={4} md={2} key={sem}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        borderRadius: 3,
                                        bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                                        backdropFilter: darkMode ? 'blur(10px)' : 'none',
                                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                        boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.3)',
                                            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'white',
                                            borderColor: '#6366f1',
                                            '& .h-text': {
                                                color: '#6366f1'
                                            }
                                        }
                                    }}
                                    onClick={() => handleDepartmentSelect(sem)}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                        <Box sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 2
                                        }}>
                                            <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? 'white' : '#4f46e5' }}>
                                                {sem}
                                            </Typography>
                                        </Box>
                                        <Typography className="h-text" variant="subtitle1" fontWeight="bold" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', transition: 'color 0.3s' }}>
                                            Semester {sem}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    }
                </Grid>

                {/* Featured Books Section */}
                <Box sx={{ mt: 8, mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 3 }}>
                        Featured Books 📚
                    </Typography>

                    {loadingBooks ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : featuredBooks.length === 0 ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', textAlign: 'center', py: 4 }}>
                                    No featured books available at the moment.
                                </Typography>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3}>
                            {featuredBooks.map((book) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                                    <BookCard
                                        book={book}
                                        onClick={() => navigate(`/book/${book.id}`)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Container>

            {/* Role Selection Dialog */}
            <Dialog
                open={roleDialogOpen}
                onClose={() => { }} // Prevent closing by clicking outside
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        bgcolor: darkMode ? '#1e293b' : 'white',
                        color: darkMode ? 'white' : 'text.primary',
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, color: darkMode ? 'white' : 'text.primary', pt: 4 }}>
                    👋 Welcome! Select Your Role
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 4, textAlign: 'center', color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                        Please select your role to personalize your experience
                    </DialogContentText>
                    <Grid container spacing={2}>
                        {USER_ROLES.map((role) => (
                            <Grid item xs={12} key={role.value}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                        '&:hover': {
                                            transform: 'scale(1.01)',
                                            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                                            borderColor: '#6366f1'
                                        }
                                    }}
                                    onClick={() => handleRoleSelect(role.value)}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Typography variant="h3" sx={{ mb: 0 }}>
                                            {role.icon}
                                        </Typography>
                                        <Box textAlign="left">
                                            <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                                {role.label}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                                Select this if you are a {role.label.toLowerCase()}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StudentDashboard;
