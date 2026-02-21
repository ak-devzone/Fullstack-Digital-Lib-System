import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    LinearProgress,
    Button,
    Snackbar,
    Alert,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    People,
    School,
    AccessTime,
    TrendingUp,
    Download,
    Search,
    FilterList
} from '@mui/icons-material';
import { DEPARTMENTS } from '../../utils/constants';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { darkMode } = useOutletContext();
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalSessions: 0,
        avgSessionDuration: 0
    });
    const [departmentStats, setDepartmentStats] = useState([]);
    const [recentSessions, setRecentSessions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // 1. Fetch User Analytics from Backend
            const userResponse = await fetch('http://localhost:8000/api/admin/users/analytics/');
            const userData = await userResponse.json();
            
            let userStats = {
                totalUsers: 0,
                activeUsers: 0,
                departmentStats: []
            };

            if (userData.success && userData.analytics) {
                userStats = {
                    totalUsers: userData.analytics.totalUsers,
                    activeUsers: userData.analytics.activeUsers,
                    departmentStats: userData.analytics.departmentDistribution
                };
            }

            // 2. Fetch Session Analytics from Firestore (Legacy)
            const sessionsQuery = query(
                collection(db, 'sessions'),
                orderBy('createdAt', 'desc'),
                limit(100)
            );
            const sessionsSnapshot = await getDocs(sessionsQuery);
            const sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate average session duration
            const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

            // 3. Set Consolidated Stats
            setStats({
                totalUsers: userStats.totalUsers,
                activeUsers: userStats.activeUsers,
                totalSessions: sessionsSnapshot.size, // This is just sample size, effectively recent sessions count
                // Ideally totalSessions should be a count query in Firestore, but for now this matches original logic
                avgSessionDuration: Math.floor(avgDuration / 60)
            });

            setDepartmentStats(userStats.departmentStats);
            setRecentSessions(sessions);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Fallback or error state? 
            // We just stop loading for now.
            setLoading(false);
        }
    };

    // Function to get filtered sessions
    const getFilteredSessions = () => {
        return recentSessions.filter(session => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = (
                (session.userId || '').toLowerCase().includes(query) ||
                (session.userName || '').toLowerCase().includes(query) ||
                (session.department || '').toLowerCase().includes(query) ||
                (session.id || '').toLowerCase().includes(query)
            );
            const matchesDept = departmentFilter === 'all' || session.department === departmentFilter;
            return matchesSearch && matchesDept;
        });
    };

    const exportToCSV = () => {
        const filteredSessions = getFilteredSessions();
        const headers = ['User ID', 'Name', 'Department', 'Login Time', 'Logout Time', 'Duration (seconds)', 'Date'];

        const csvData = filteredSessions.map(s => [
            s.userId || '',
            s.userName || '',
            s.department || '',
            formatDate(s.loginTime),
            formatDate(s.logoutTime),
            s.duration || 0,
            s.date || ''
        ]);

        const csv = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sessions_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        setSnackbar({ open: true, message: 'CSV exported successfully!', severity: 'success' });
    };



    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };





    if (loading) {
        return (
            <Box sx={{ width: '100%', mt: 4 }}>
                <LinearProgress />
            </Box>
        );
    }

    const filteredSessions = getFilteredSessions();

    return (
        <Box>
            {/* Main Content */}
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                {/* Header & Actions */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 1 }}>
                            Analytics Overview
                        </Typography>
                        <Typography variant="body1" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                            Monitor system performance and user activity.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={exportToCSV}
                        sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                            borderRadius: 2,
                            fontWeight: 'bold',
                            px: 3,
                            py: 1.5,
                            textTransform: 'none'
                        }}
                    >
                        Export Data
                    </Button>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: 'white',
                            borderRadius: 4,
                            boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                right: -20,
                                top: -20,
                                opacity: 0.2,
                                transform: 'rotate(15deg)'
                            }}>
                                <People sx={{ fontSize: 120 }} />
                            </Box>
                            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                                    Total Users
                                </Typography>
                                <Typography variant="h3" fontWeight="800" sx={{ mt: 1 }}>
                                    {stats.totalUsers}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                                    Registered Accounts
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                            color: 'white',
                            borderRadius: 4,
                            boxShadow: '0 10px 30px -10px rgba(236, 72, 153, 0.5)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                right: -20,
                                top: -20,
                                opacity: 0.2,
                                transform: 'rotate(15deg)'
                            }}>
                                <TrendingUp sx={{ fontSize: 120 }} />
                            </Box>
                            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                                    Active Users
                                </Typography>
                                <Typography variant="h3" fontWeight="800" sx={{ mt: 1 }}>
                                    {stats.activeUsers}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                                    Currently Online
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            borderRadius: 4,
                            boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.5)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                right: -20,
                                top: -20,
                                opacity: 0.2,
                                transform: 'rotate(15deg)'
                            }}>
                                <AccessTime sx={{ fontSize: 120 }} />
                            </Box>
                            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                                    Total Sessions
                                </Typography>
                                <Typography variant="h3" fontWeight="800" sx={{ mt: 1 }}>
                                    {stats.totalSessions}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                                    All Time
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            borderRadius: 4,
                            boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.5)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                right: -20,
                                top: -20,
                                opacity: 0.2,
                                transform: 'rotate(15deg)'
                            }}>
                                <School sx={{ fontSize: 120 }} />
                            </Box>
                            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                                    Avg Session
                                </Typography>
                                <Typography variant="h3" fontWeight="800" sx={{ mt: 1 }}>
                                    {stats.avgSessionDuration}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                                    Minutes per User
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Department Distribution & Recent Sessions */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: 4,
                            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                            backdropFilter: darkMode ? 'blur(10px)' : 'none',
                            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                            boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            color: darkMode ? 'white' : 'text.primary'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ width: 8, height: 24, bgcolor: '#f59e0b', borderRadius: 4 }} />
                                    Department Distribution
                                </Typography>
                                {departmentStats.map((dept) => (
                                    <Box key={dept.code} sx={{ mb: 3 }}>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                                {dept.name}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {dept.count} <span style={{ color: '#f59e0b', fontSize: '0.8em' }}>({dept.percentage}%)</span>
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={parseFloat(dept.percentage)}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: '#f59e0b',
                                                    borderRadius: 4
                                                }
                                            }}
                                        />
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: 4,
                            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                            backdropFilter: darkMode ? 'blur(10px)' : 'none',
                            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                            boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            color: darkMode ? 'white' : 'text.primary'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ width: 8, height: 24, bgcolor: '#ec4899', borderRadius: 4 }} />
                                    Recent Sessions
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>User</TableCell>
                                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Duration</TableCell>
                                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Logged In</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredSessions.slice(0, 5).map((session) => (
                                                <TableRow key={session.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {session.userName}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: darkMode ? '#64748b' : 'text.secondary' }}>
                                                                {session.userId}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                                                        <Chip
                                                            label={formatDuration(session.duration || 0)}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                                color: '#818cf8',
                                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                                                        <Typography variant="caption">
                                                            {formatDate(session.loginTime)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Full Sessions Table */}
                <Card sx={{
                    borderRadius: 4,
                    bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                    backdropFilter: darkMode ? 'blur(10px)' : 'none',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    color: darkMode ? 'white' : 'text.primary'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold">
                                User Activity Timeline ({filteredSessions.length} sessions)
                            </Typography>
                            {(searchQuery || departmentFilter !== 'all') && (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setDepartmentFilter('all');
                                    }}
                                    sx={{ color: darkMode ? '#94a3b8' : 'primary.main' }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </Box>

                        {/* Search and Filter Controls */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search by User ID, Name, Email, or Department..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            color: darkMode ? 'white' : 'text.primary',
                                            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.23)'
                                            }
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'text.primary'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>Filter by Department</InputLabel>
                                    <Select
                                        value={departmentFilter}
                                        label="Filter by Department"
                                        onChange={(e) => setDepartmentFilter(e.target.value)}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <FilterList sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }} />
                                            </InputAdornment>
                                        }
                                        sx={{
                                            color: darkMode ? 'white' : 'text.primary',
                                            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
                                            '.MuiOutlinedInput-notchedOutline': {
                                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.23)'
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'text.primary'
                                            },
                                            '.MuiSvgIcon-root': {
                                                color: darkMode ? '#94a3b8' : 'text.secondary'
                                            }
                                        }}
                                    >
                                        <MenuItem value="all">All Departments</MenuItem>
                                        {DEPARTMENTS.map((dept) => (
                                            <MenuItem key={dept.code} value={dept.code}>
                                                {dept.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>User ID</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Name</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Department</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Login Time</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Logout Time</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Duration</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSessions.map((session) => (
                                        <TableRow key={session.id} hover sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.05) !important' : 'rgba(0,0,0,0.04) !important' } }}>
                                            <TableCell sx={{ borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                                                <Chip label={session.userId} size="small" sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'default', color: darkMode ? 'white' : 'text.primary' }} />
                                            </TableCell>
                                            <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>{session.userName}</TableCell>
                                            <TableCell sx={{ borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                                                <Chip label={session.department} size="small" color="secondary" variant="outlined" />
                                            </TableCell>
                                            <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>{formatDate(session.loginTime)}</TableCell>
                                            <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>{formatDate(session.logoutTime)}</TableCell>
                                            <TableCell sx={{ borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                                                <Chip
                                                    label={formatDuration(session.duration || 0)}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Container>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminDashboard;
