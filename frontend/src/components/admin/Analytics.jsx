import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    MenuBook,
    People,
    AttachMoney,
    TrendingUp,
    Visibility,
    Download,
    ShoppingCart
} from '@mui/icons-material';
import { API_URL } from '../../utils/constants';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const Analytics = () => {
    const { darkMode } = useOutletContext();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBooks: 0,
        freeBooks: 0,
        premiumBooks: 0,
        totalStudents: 0,
        totalRevenue: 0,
        booksThisMonth: 0,
        newStudentsThisMonth: 0,
        totalPurchases: 0
    });
    const [recentBooks, setRecentBooks] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [recentPurchases, setRecentPurchases] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [departmentRevenue, setDepartmentRevenue] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Fetch dashboard stats
            const statsResponse = await fetch(`${API_URL}/analytics/dashboard/`);
            const statsData = await statsResponse.json();

            if (statsData.success) {
                setStats(statsData.stats);
                setRecentBooks(statsData.recentBooks || []);
                setPopularBooks(statsData.popularBooks || []);
                setRecentPurchases(statsData.recentPurchases || []);
            }

            // Fetch revenue analytics
            const revenueResponse = await fetch(`${API_URL}/analytics/revenue/?period=30days`);
            const revenueData = await revenueResponse.json();

            if (revenueData.success) {
                setRevenueData(revenueData.dailyRevenue || []);
                setDepartmentRevenue(revenueData.departmentRevenue || []);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, color, bgColor }) => (
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
                        <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 0.5 }}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                {subtitle}
                            </Typography>
                        )}
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 1 }}>
                    Analytics Dashboard 📊
                </Typography>
                <Typography variant="body1" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                    Monitor your digital library performance and insights
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Books"
                        value={stats.totalBooks}
                        subtitle={`${stats.freeBooks} free, ${stats.premiumBooks} premium`}
                        icon={MenuBook}
                        color="#4f46e5"
                        bgColor="rgba(79, 70, 229, 0.1)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Students"
                        value={stats.totalStudents}
                        subtitle={`+${stats.newStudentsThisMonth} this month`}
                        icon={People}
                        color="#ec4899"
                        bgColor="rgba(236, 72, 153, 0.1)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats.totalRevenue.toLocaleString()}`}
                        subtitle={`${stats.totalPurchases} purchases`}
                        icon={AttachMoney}
                        color="#10b981"
                        bgColor="rgba(16, 185, 129, 0.1)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Books This Month"
                        value={stats.booksThisMonth}
                        subtitle="New uploads"
                        icon={TrendingUp}
                        color="#f59e0b"
                        bgColor="rgba(245, 158, 11, 0.1)"
                    />
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                        backdropFilter: darkMode ? 'blur(10px)' : 'none',
                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                        minHeight: 400
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: darkMode ? 'white' : 'text.primary', mb: 3 }}>
                            Revenue Overview (Last 30 Days)
                        </Typography>
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                    <XAxis
                                        dataKey="date"
                                        stroke={darkMode ? '#94a3b8' : '#64748b'}
                                        tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }}
                                    />
                                    <YAxis
                                        stroke={darkMode ? '#94a3b8' : '#64748b'}
                                        tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: darkMode ? '#1e293b' : 'white',
                                            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                            borderRadius: '8px',
                                            color: darkMode ? 'white' : 'black'
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 300,
                                bgcolor: darkMode ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc',
                                borderRadius: 2
                            }}>
                                <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                    No revenue data available
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                        backdropFilter: darkMode ? 'blur(10px)' : 'none',
                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                        minHeight: 400
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: darkMode ? 'white' : 'text.primary', mb: 3 }}>
                            Revenue by Department
                        </Typography>
                        {departmentRevenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={departmentRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                    <XAxis
                                        dataKey="department"
                                        stroke={darkMode ? '#94a3b8' : '#64748b'}
                                        tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        stroke={darkMode ? '#94a3b8' : '#64748b'}
                                        tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: darkMode ? '#1e293b' : 'white',
                                            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                            borderRadius: '8px',
                                            color: darkMode ? 'white' : 'black'
                                        }}
                                    />
                                    <Bar dataKey="revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                minHeight: 300,
                                bgcolor: darkMode ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc',
                                borderRadius: 2,
                                gap: 2
                            }}>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981' }}>
                                    {stats.freeBooks}
                                </Typography>
                                <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                    Free Books
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#fbbf24' }}>
                                    {stats.premiumBooks}
                                </Typography>
                                <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                    Premium Books
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Recent Activity & Popular Books */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                        backdropFilter: darkMode ? 'blur(10px)' : 'none',
                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: darkMode ? 'white' : 'text.primary', mb: 3 }}>
                            Recent Book Uploads
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Title</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Department</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Type</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentBooks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', py: 4 }}>
                                                No recent uploads
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentBooks.slice(0, 5).map((book, index) => (
                                            <TableRow key={index}>
                                                <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                                    {book.title}
                                                </TableCell>
                                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                                    {book.department}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={book.isPremium ? `₹${book.price}` : 'Free'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: book.isPremium ? '#fbbf24' : '#10b981',
                                                            color: book.isPremium ? '#78350f' : 'white',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                        backdropFilter: darkMode ? 'blur(10px)' : 'none',
                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: darkMode ? 'white' : 'text.primary', mb: 3 }}>
                            Popular Books
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Title</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }} align="right">Views</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }} align="right">Downloads</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {popularBooks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', py: 4 }}>
                                                No data available
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        popularBooks.slice(0, 5).map((book, index) => (
                                            <TableRow key={index}>
                                                <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                                    {book.title}
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                                        <Visibility sx={{ fontSize: 16 }} />
                                                        {book.views || 0}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                                        <Download sx={{ fontSize: 16 }} />
                                                        {book.downloads || 0}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Analytics;
