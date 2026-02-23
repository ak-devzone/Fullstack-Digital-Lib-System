import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { DEPARTMENTS, API_URL } from '../../utils/constants';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Snackbar,
    Grid,
    Card,
    CardContent,
    Avatar
} from '@mui/material';
import {
    Search,
    Visibility,
    Edit,
    CheckCircle,
    Cancel,
    Block,
    CheckCircleOutline,
    People,
    VerifiedUser,
    Block as BlockIcon,
    TrendingUp,
    History,
    AccessTime
} from '@mui/icons-material';




const UserManagement = () => {
    const navigate = useNavigate();
    const { darkMode } = useOutletContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [idProofFilter, setIdProofFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [idProofDialogOpen, setIdProofDialogOpen] = useState(false);
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [userHistory, setUserHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [analytics, setAnalytics] = useState({
        totalUsers: 0,
        pendingVerifications: 0,
        suspendedUsers: 0,
        activeUsers: 0
    });

    // Edit user dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '', mobile: '', department: '', semester: '', role: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchAnalytics();
    }, [departmentFilter, roleFilter, idProofFilter, searchQuery]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (departmentFilter !== 'all') params.append('department', departmentFilter);
            if (roleFilter !== 'all') params.append('role', roleFilter);
            if (idProofFilter !== 'all') params.append('id_proof_status', idProofFilter);
            if (searchQuery) params.append('search', searchQuery);

            const response = await fetch(`${API_URL}/admin/users/?${params}`);
            const data = await response.json();

            if (data.success) {
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showSnackbar('Error fetching users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users/analytics/`);
            const data = await response.json();

            if (data.success) {
                setAnalytics(data.analytics);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const handleViewDetails = async (user) => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${user.id}/`);
            const data = await response.json();

            if (data.success) {
                setSelectedUser(data.user);
                setDetailsOpen(true);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            showSnackbar('Error fetching user details', 'error');
        }
    };

    const handleVerifyId = async (userId, verified) => {
        if (!verified) {
            // Open rejection dialog
            setRejectionDialogOpen(true);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/verify-id/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified })
            });

            const data = await response.json();

            if (data.success) {
                showSnackbar(data.message, 'success');
                fetchUsers();
                fetchAnalytics();
                setDetailsOpen(false);
                setIdProofDialogOpen(false);
            }
        } catch (error) {
            console.error('Error verifying ID:', error);
            showSnackbar('Error verifying ID proof', 'error');
        }
    };

    const handleRejectWithReason = async () => {
        if (!rejectionReason.trim()) {
            showSnackbar('Please provide a rejection reason', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}/verify-id/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified: false, reason: rejectionReason })
            });

            const data = await response.json();

            if (data.success) {
                showSnackbar(data.message, 'success');
                fetchUsers();
                fetchAnalytics();
                setDetailsOpen(false);
                setIdProofDialogOpen(false);
                setRejectionDialogOpen(false);
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Error rejecting ID:', error);
            showSnackbar('Error rejecting ID proof', 'error');
        }
    };

    const handleSuspendUser = async (userId, suspended) => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/suspend/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ suspended })
            });

            const data = await response.json();

            if (data.success) {
                showSnackbar(data.message, 'success');
                fetchUsers();
                fetchAnalytics();
                setDetailsOpen(false);
            }
        } catch (error) {
            console.error('Error suspending user:', error);
            showSnackbar('Error updating user status', 'error');
        }
    };

    const handleViewHistory = async (user) => {
        setSelectedUser(user);
        setHistoryDialogOpen(true);
        setHistoryLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/users/${user.id}/history/`);
            const data = await response.json();

            if (data.success) {
                setUserHistory(data.history || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            showSnackbar('Error fetching user history', 'error');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name || '',
            mobile: user.mobile || '',
            department: user.department || '',
            semester: user.semester || '',
            role: user.role || 'student',
        });
        setEditDialogOpen(true);
    };

    const handleSaveUser = async () => {
        if (!editFormData.name.trim()) {
            showSnackbar('Name cannot be empty', 'error');
            return;
        }
        try {
            setEditSaving(true);
            const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}/update/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            });
            const data = await response.json();
            if (data.success) {
                showSnackbar('User updated successfully', 'success');
                setEditDialogOpen(false);
                fetchUsers();
            } else {
                showSnackbar(data.error || 'Failed to update user', 'error');
            }
        } catch (err) {
            showSnackbar('Network error updating user', 'error');
        } finally {
            setEditSaving(false);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
        <Card sx={{
            height: '100%',
            borderRadius: 3,
            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
            backdropFilter: darkMode ? 'blur(10px)' : 'none',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 1 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary' }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{
                        bgcolor: bgColor,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Icon sx={{ fontSize: 28, color: color }} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 1 }}>
                    User Management 👥
                </Typography>
                <Typography variant="body1" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                    Manage students, verify ID proofs, and monitor user activity
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/admin/register')}
                        sx={{
                            background: 'linear-gradient(45deg, #4f46e5 30%, #ec4899 90%)',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    >
                        Add New Admin
                    </Button>
                </Box>
            </Box>

            {/* Analytics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={analytics.totalUsers}
                        icon={People}
                        color="#4f46e5"
                        bgColor="rgba(79, 70, 229, 0.1)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Verifications"
                        value={analytics.pendingVerifications}
                        icon={VerifiedUser}
                        color="#f59e0b"
                        bgColor="rgba(245, 158, 11, 0.1)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Users"
                        value={analytics.activeUsers}
                        icon={CheckCircleOutline}
                        color="#10b981"
                        bgColor="rgba(16, 185, 129, 0.1)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Suspended Users"
                        value={analytics.suspendedUsers}
                        icon={BlockIcon}
                        color="#ef4444"
                        bgColor="rgba(239, 68, 68, 0.1)"
                    />
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search by name, email, or user ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: darkMode ? 'white' : 'text.primary',
                                    '& fieldset': {
                                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.23)',
                                    },
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>Department</InputLabel>
                            <Select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                label="Department"
                                sx={{
                                    color: darkMode ? 'white' : 'text.primary',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.23)',
                                    },
                                }}
                            >
                                <MenuItem value="all">All Departments</MenuItem>
                                {DEPARTMENTS.map(dept => (
                                    <MenuItem key={dept.code} value={dept.code}>{dept.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>Role</InputLabel>
                            <Select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                label="Role"
                                sx={{
                                    color: darkMode ? 'white' : 'text.primary',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.23)',
                                    },
                                }}
                            >
                                <MenuItem value="all">All Roles</MenuItem>
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="faculty">Faculty</MenuItem>
                                <MenuItem value="alumni">Alumni</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>ID Proof</InputLabel>
                            <Select
                                value={idProofFilter}
                                onChange={(e) => setIdProofFilter(e.target.value)}
                                label="ID Proof"
                                sx={{
                                    color: darkMode ? 'white' : 'text.primary',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.23)',
                                    },
                                }}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="verified">Verified</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="not_uploaded">Not Uploaded</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                                setSearchQuery('');
                                setDepartmentFilter('all');
                                setRoleFilter('all');
                                setIdProofFilter('all');
                            }}
                            sx={{ height: '56px' }}
                        >
                            Clear Filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* User Table */}
            <Paper sx={{
                borderRadius: 3,
                bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Department</TableCell>
                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Role</TableCell>
                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>ID Proof</TableCell>
                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Purchases</TableCell>
                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: '#4f46e5' }}>
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: darkMode ? 'white' : 'text.primary' }}>
                                                        {user.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                            {user.department}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                size="small"
                                                sx={{
                                                    bgcolor: user.role === 'student' ? '#3b82f6' : user.role === 'faculty' ? '#8b5cf6' : '#10b981',
                                                    color: 'white',
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {user.idProofVerified ? (
                                                <Chip
                                                    icon={<CheckCircle />}
                                                    label="Verified"
                                                    size="small"
                                                    sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600 }}
                                                />
                                            ) : user.idProofUrl ? (
                                                <Chip
                                                    icon={<VerifiedUser />}
                                                    label="Pending"
                                                    size="small"
                                                    sx={{ bgcolor: '#f59e0b', color: 'white', fontWeight: 600 }}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Not Uploaded"
                                                    size="small"
                                                    sx={{ bgcolor: '#6b7280', color: 'white', fontWeight: 600 }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 600 }}>
                                            {user.purchaseCount || 0}
                                        </TableCell>
                                        <TableCell>
                                            {user.suspended ? (
                                                <Chip
                                                    icon={<Block />}
                                                    label="Suspended"
                                                    size="small"
                                                    sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 600 }}
                                                />
                                            ) : (
                                                <Chip
                                                    icon={<CheckCircleOutline />}
                                                    label="Active"
                                                    size="small"
                                                    sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600 }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleViewDetails(user)}
                                                sx={{ color: '#4f46e5' }}
                                                title="View Details"
                                            >
                                                <Visibility />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleEditUser(user)}
                                                sx={{ color: '#10b981' }}
                                                title="Edit User"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleViewHistory(user)}
                                                sx={{ color: '#f59e0b' }}
                                                title="View Session History"
                                            >
                                                <History />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: darkMode ? '#1e293b' : 'white',
                        borderRadius: 3,
                    }
                }}
            >
                {selectedUser && (
                    <>
                        <DialogTitle sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 700, borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#4f46e5', width: 56, height: 56, fontSize: '1.5rem' }}>
                                    {selectedUser.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {selectedUser.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                        {selectedUser.email}
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ pt: 3 }}>
                            {/* ID Proof Section - FIRST */}
                            {selectedUser.idProofUrl && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" sx={{ color: darkMode ? 'white' : 'text.primary', mb: 2, fontWeight: 700 }}>
                                        📋 ID Proof Verification
                                    </Typography>
                                    <Paper sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: darkMode ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc',
                                        border: selectedUser.idProofVerified
                                            ? '2px solid #10b981'
                                            : selectedUser.idProofRejectionReason
                                                ? '2px solid #ef4444'
                                                : '2px solid #f59e0b'
                                    }}>
                                        {/* View Document Button */}
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={() => setIdProofDialogOpen(true)}
                                            sx={{
                                                bgcolor: '#4f46e5',
                                                '&:hover': { bgcolor: '#4338ca' },
                                                fontWeight: 700,
                                                py: 1.5,
                                                mb: 2
                                            }}
                                        >
                                            📄 View ID Proof Document
                                        </Button>

                                        {/* Verification Status */}
                                        <Box sx={{ mb: 2 }}>
                                            {selectedUser.idProofVerified ? (
                                                <Alert severity="success" sx={{ fontWeight: 600 }}>
                                                    ✅ ID Proof Verified
                                                </Alert>
                                            ) : selectedUser.idProofRejectionReason ? (
                                                <Alert severity="error" sx={{ fontWeight: 600 }}>
                                                    ❌ ID Proof Rejected
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        <strong>Reason:</strong> {selectedUser.idProofRejectionReason}
                                                    </Typography>
                                                </Alert>
                                            ) : (
                                                <Alert severity="warning" sx={{ fontWeight: 600 }}>
                                                    ⏳ Pending Verification - Please review and take action
                                                </Alert>
                                            )}
                                        </Box>

                                        {/* Action Buttons */}
                                        {!selectedUser.idProofVerified && (
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    size="large"
                                                    startIcon={<CheckCircle />}
                                                    onClick={() => handleVerifyId(selectedUser.id, true)}
                                                    sx={{
                                                        bgcolor: '#10b981',
                                                        '&:hover': { bgcolor: '#059669' },
                                                        fontWeight: 700,
                                                        py: 1.5
                                                    }}
                                                >
                                                    ✓ Verify & Approve
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    size="large"
                                                    startIcon={<Cancel />}
                                                    onClick={() => handleVerifyId(selectedUser.id, false)}
                                                    sx={{
                                                        borderColor: '#ef4444',
                                                        color: '#ef4444',
                                                        '&:hover': {
                                                            borderColor: '#dc2626',
                                                            bgcolor: 'rgba(239, 68, 68, 0.1)'
                                                        },
                                                        fontWeight: 700,
                                                        py: 1.5
                                                    }}
                                                >
                                                    ✗ Reject
                                                </Button>
                                            </Box>
                                        )}
                                    </Paper>
                                </Box>
                            )}

                            {/* User Information */}
                            <Typography variant="h6" sx={{ color: darkMode ? 'white' : 'text.primary', mb: 2, fontWeight: 700 }}>
                                👤 User Information
                            </Typography>
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 0.5 }}>
                                        Department
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 600 }}>
                                        {selectedUser.department}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 0.5 }}>
                                        Semester
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 600 }}>
                                        {selectedUser.semester}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 0.5 }}>
                                        Role
                                    </Typography>
                                    <Chip
                                        label={selectedUser.role}
                                        sx={{
                                            bgcolor: selectedUser.role === 'student' ? '#3b82f6' : selectedUser.role === 'faculty' ? '#8b5cf6' : '#10b981',
                                            color: 'white',
                                            fontWeight: 600
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 0.5 }}>
                                        Total Purchases
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 600 }}>
                                        {selectedUser.purchaseHistory?.length || 0} books
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Purchase History */}
                            {selectedUser.purchaseHistory && selectedUser.purchaseHistory.length > 0 && (
                                <Box>
                                    <Typography variant="h6" sx={{ color: darkMode ? 'white' : 'text.primary', mb: 2, fontWeight: 700 }}>
                                        📚 Purchase History
                                    </Typography>
                                    <TableContainer component={Paper} sx={{
                                        borderRadius: 2,
                                        bgcolor: darkMode ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc'
                                    }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Book</TableCell>
                                                    <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }} align="right">Amount</TableCell>
                                                    <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }} align="right">Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedUser.purchaseHistory.map((purchase, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                                            {purchase.bookTitle}
                                                        </TableCell>
                                                        <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 600 }} align="right">
                                                            ₹{purchase.amount}
                                                        </TableCell>
                                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }} align="right">
                                                            {new Date(purchase.purchasedAt?.seconds * 1000).toLocaleDateString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
                            {selectedUser.suspended ? (
                                <Button
                                    variant="contained"
                                    startIcon={<CheckCircleOutline />}
                                    onClick={() => handleSuspendUser(selectedUser.id, false)}
                                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700 }}
                                >
                                    Activate User
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    startIcon={<Block />}
                                    onClick={() => handleSuspendUser(selectedUser.id, true)}
                                    sx={{ borderColor: '#ef4444', color: '#ef4444', fontWeight: 700 }}
                                >
                                    Suspend User
                                </Button>
                            )}
                            <Button onClick={() => setDetailsOpen(false)} sx={{ fontWeight: 600 }}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* ID Proof Viewing Dialog */}
            <Dialog
                open={idProofDialogOpen}
                onClose={() => setIdProofDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: darkMode ? '#1e293b' : 'white',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 700 }}>
                    📄 ID Proof Document
                </DialogTitle>
                <DialogContent>
                    {selectedUser && selectedUser.idProofUrl && (
                        (selectedUser.idProofUrl.toLowerCase().endsWith('.pdf') || selectedUser.idProofUrl.toLowerCase().includes('.pdf?')) ? (
                            <Box
                                component="iframe"
                                src={selectedUser.idProofUrl}
                                title="ID Proof PDF"
                                sx={{
                                    width: '100%',
                                    height: '70vh',
                                    border: 'none',
                                    borderRadius: 2,
                                    bgcolor: 'white'
                                }}
                            />
                        ) : (
                            <Box
                                component="img"
                                src={selectedUser.idProofUrl}
                                alt="ID Proof"
                                sx={{
                                    width: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: 2,
                                    bgcolor: 'white'
                                }}
                            />
                        )
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIdProofDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Session History Dialog */}
            <Dialog
                open={historyDialogOpen}
                onClose={() => setHistoryDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: darkMode ? '#1e293b' : 'white',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 700, borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <History sx={{ color: '#f59e0b' }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Session History - {selectedUser?.name}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {historyLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : userHistory.length === 0 ? (
                        <Box sx={{ textAlign: 'center', p: 4, color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                            <History sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                            <Typography>No session history found for this user.</Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} sx={{
                            borderRadius: 2,
                            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc',
                            maxHeight: '60vh'
                        }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: darkMode ? '#1e293b' : '#f1f5f9', color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Date</TableCell>
                                        <TableCell sx={{ bgcolor: darkMode ? '#1e293b' : '#f1f5f9', color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Login Time</TableCell>
                                        <TableCell sx={{ bgcolor: darkMode ? '#1e293b' : '#f1f5f9', color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Logout Time</TableCell>
                                        <TableCell sx={{ bgcolor: darkMode ? '#1e293b' : '#f1f5f9', color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }} align="right">Duration</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userHistory.map((session, index) => {
                                        // Calculate duration display
                                        const formatDuration = (seconds) => {
                                            if (!seconds) return '-';
                                            const h = Math.floor(seconds / 3600);
                                            const m = Math.floor((seconds % 3600) / 60);
                                            const s = seconds % 60;
                                            return `${h}h ${m}m ${s}s`;
                                        };

                                        return (
                                            <TableRow key={index} hover>
                                                <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                                    {session.date}
                                                </TableCell>
                                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                                    {session.loginTime ? new Date(session.loginTime).toLocaleTimeString() : '-'}
                                                </TableCell>
                                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                                    {session.logoutTime ? new Date(session.logoutTime).toLocaleTimeString() : '-'}
                                                </TableCell>
                                                <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 600 }} align="right">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                                        <AccessTime sx={{ fontSize: 16, color: '#4f46e5' }} />
                                                        {formatDuration(session.duration)}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <Button onClick={() => setHistoryDialogOpen(false)} sx={{ fontWeight: 600 }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Rejection Reason Dialog */}
            <Dialog
                open={rejectionDialogOpen}
                onClose={() => {
                    setRejectionDialogOpen(false);
                    setRejectionReason('');
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: darkMode ? '#1e293b' : 'white',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 700 }}>
                    ❌ Reject ID Proof
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 2 }}>
                        Please provide a reason for rejecting this ID proof. This will be shown to the student.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Rejection Reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g., Image is unclear, ID is expired, etc."
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: darkMode ? 'white' : 'text.primary',
                                '& fieldset': {
                                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.23)',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: darkMode ? '#94a3b8' : 'text.secondary',
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => {
                            setRejectionDialogOpen(false);
                            setRejectionReason('');
                        }}
                        sx={{ fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleRejectWithReason}
                        sx={{
                            bgcolor: '#ef4444',
                            '&:hover': { bgcolor: '#dc2626' },
                            fontWeight: 700
                        }}
                    >
                        Reject with Reason
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => !editSaving && setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: darkMode ? '#1e293b' : 'white',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle sx={{
                    color: darkMode ? 'white' : 'text.primary',
                    fontWeight: 700,
                    borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', gap: 1.5
                }}>
                    <Edit sx={{ color: '#10b981' }} /> Edit User — {selectedUser?.name}
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Full Name" value={editFormData.name}
                                onChange={(e) => setEditFormData(p => ({ ...p, name: e.target.value }))}
                                disabled={editSaving}
                                sx={{ '& .MuiOutlinedInput-root': { color: darkMode ? 'white' : 'text.primary', '& fieldset': { borderColor: darkMode ? 'rgba(255,255,255,0.15)' : undefined } }, '& .MuiInputLabel-root': { color: darkMode ? '#94a3b8' : undefined } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Mobile" value={editFormData.mobile}
                                onChange={(e) => setEditFormData(p => ({ ...p, mobile: e.target.value }))}
                                disabled={editSaving}
                                sx={{ '& .MuiOutlinedInput-root': { color: darkMode ? 'white' : 'text.primary', '& fieldset': { borderColor: darkMode ? 'rgba(255,255,255,0.15)' : undefined } }, '& .MuiInputLabel-root': { color: darkMode ? '#94a3b8' : undefined } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth disabled={editSaving}>
                                <InputLabel sx={{ color: darkMode ? '#94a3b8' : undefined }}>Role</InputLabel>
                                <Select
                                    value={editFormData.role}
                                    onChange={(e) => setEditFormData(p => ({ ...p, role: e.target.value }))}
                                    label="Role"
                                    sx={{ color: darkMode ? 'white' : 'text.primary', '& .MuiOutlinedInput-notchedOutline': { borderColor: darkMode ? 'rgba(255,255,255,0.15)' : undefined } }}
                                >
                                    <MenuItem value="student">Student</MenuItem>
                                    <MenuItem value="faculty">Faculty</MenuItem>
                                    <MenuItem value="alumni">Alumni</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth disabled={editSaving}>
                                <InputLabel sx={{ color: darkMode ? '#94a3b8' : undefined }}>Department</InputLabel>
                                <Select
                                    value={editFormData.department}
                                    onChange={(e) => setEditFormData(p => ({ ...p, department: e.target.value }))}
                                    label="Department"
                                    sx={{ color: darkMode ? 'white' : 'text.primary', '& .MuiOutlinedInput-notchedOutline': { borderColor: darkMode ? 'rgba(255,255,255,0.15)' : undefined } }}
                                >
                                    {DEPARTMENTS.map(d => (
                                        <MenuItem key={d.code} value={d.code}>{d.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth disabled={editSaving}>
                                <InputLabel sx={{ color: darkMode ? '#94a3b8' : undefined }}>Semester</InputLabel>
                                <Select
                                    value={editFormData.semester}
                                    onChange={(e) => setEditFormData(p => ({ ...p, semester: e.target.value }))}
                                    label="Semester"
                                    sx={{ color: darkMode ? 'white' : 'text.primary', '& .MuiOutlinedInput-notchedOutline': { borderColor: darkMode ? 'rgba(255,255,255,0.15)' : undefined } }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <MenuItem key={s} value={s}>Semester {s}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', gap: 1 }}>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={editSaving} sx={{ fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveUser}
                        disabled={editSaving}
                        startIcon={editSaving ? <CircularProgress size={16} color="inherit" /> : <Edit />}
                        sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700, minWidth: 120 }}
                    >
                        {editSaving ? 'Saving…' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container >
    );
};

export default UserManagement;
