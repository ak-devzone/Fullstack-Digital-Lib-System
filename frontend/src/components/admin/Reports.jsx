import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Tabs,
    Tab,
    Grid,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Download,
    Print,
    TrendingUp,
    Inventory,
    People,
    Assessment
} from '@mui/icons-material';
import { API_URL } from '../../utils/constants';

const Reports = () => {
    const { darkMode } = useOutletContext();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        // Set default date range (last 30 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchReportData();
        }
    }, [activeTab, startDate, endDate]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 0: // Sales Report
                    endpoint = `${API_URL}/analytics/revenue/?period=custom&start_date=${startDate}&end_date=${endDate}`;
                    break;
                case 1: // Inventory Report
                    endpoint = `${API_URL}/analytics/dashboard/`;
                    break;
                case 2: // User Report
                    endpoint = `${API_URL}/admin/users/analytics/`;
                    break;
                case 3: // Activity Report
                    endpoint = `${API_URL}/analytics/dashboard/`;
                    break;
                default:
                    break;
            }

            const response = await fetch(endpoint);
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!reportData) return;

        let csvContent = '';
        let filename = '';

        switch (activeTab) {
            case 0: // Sales Report
                filename = `sales_report_${startDate}_to_${endDate}.csv`;
                csvContent = 'Date,Revenue,Purchases\n';
                if (reportData.dailyRevenue) {
                    reportData.dailyRevenue.forEach(row => {
                        csvContent += `${row.date},${row.revenue},${row.purchases || 0}\n`;
                    });
                }
                break;
            case 1: // Inventory Report
                filename = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
                csvContent = 'Category,Count\n';
                if (reportData.stats) {
                    csvContent += `Total Books,${reportData.stats.totalBooks}\n`;
                    csvContent += `Free Books,${reportData.stats.freeBooks}\n`;
                    csvContent += `Premium Books,${reportData.stats.premiumBooks}\n`;
                    csvContent += `Books This Month,${reportData.stats.booksThisMonth}\n`;
                }
                break;
            case 2: // User Report
                filename = `user_report_${new Date().toISOString().split('T')[0]}.csv`;
                csvContent = 'Category,Count\n';
                if (reportData.analytics) {
                    csvContent += `Total Users,${reportData.analytics.totalUsers}\n`;
                    csvContent += `Active Users,${reportData.analytics.activeUsers}\n`;
                    csvContent += `Suspended Users,${reportData.analytics.suspendedUsers}\n`;
                    csvContent += `Pending Verifications,${reportData.analytics.pendingVerifications}\n`;
                }
                break;
            case 3: // Activity Report
                filename = `activity_report_${new Date().toISOString().split('T')[0]}.csv`;
                csvContent = 'Book Title,Views,Downloads\n';
                if (reportData.popularBooks) {
                    reportData.popularBooks.forEach(book => {
                        csvContent += `"${book.title}",${book.views || 0},${book.downloads || 0}\n`;
                    });
                }
                break;
            default:
                break;
        }

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <Card sx={{
            borderRadius: 3,
            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
            backdropFilter: darkMode ? 'blur(10px)' : 'none',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 1 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary' }}>
                            {value}
                        </Typography>
                    </Box>
                    <Icon sx={{ fontSize: 40, color: color, opacity: 0.7 }} />
                </Box>
            </CardContent>
        </Card>
    );

    const renderSalesReport = () => {
        if (!reportData || !reportData.dailyRevenue) return null;

        const totalRevenue = reportData.dailyRevenue.reduce((sum, day) => sum + (day.revenue || 0), 0);
        const totalPurchases = reportData.dailyRevenue.reduce((sum, day) => sum + (day.purchases || 0), 0);

        return (
            <Box>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <StatCard
                            title="Total Revenue"
                            value={`₹${totalRevenue.toLocaleString()}`}
                            icon={TrendingUp}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <StatCard
                            title="Total Purchases"
                            value={totalPurchases}
                            icon={Assessment}
                            color="#4f46e5"
                        />
                    </Grid>
                </Grid>

                <TableContainer component={Paper} sx={{
                    borderRadius: 3,
                    bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                    backdropFilter: darkMode ? 'blur(10px)' : 'none',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }} align="right">Revenue</TableCell>
                                <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }} align="right">Purchases</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.dailyRevenue.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }}>{row.date}</TableCell>
                                    <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }} align="right">₹{row.revenue.toLocaleString()}</TableCell>
                                    <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }} align="right">{row.purchases || 0}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    const renderInventoryReport = () => {
        if (!reportData || !reportData.stats) return null;

        return (
            <Box>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Books"
                            value={reportData.stats.totalBooks}
                            icon={Inventory}
                            color="#4f46e5"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Free Books"
                            value={reportData.stats.freeBooks}
                            icon={Inventory}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Premium Books"
                            value={reportData.stats.premiumBooks}
                            icon={Inventory}
                            color="#fbbf24"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Books This Month"
                            value={reportData.stats.booksThisMonth}
                            icon={TrendingUp}
                            color="#f59e0b"
                        />
                    </Grid>
                </Grid>

                {reportData.recentBooks && reportData.recentBooks.length > 0 && (
                    <TableContainer component={Paper} sx={{
                        borderRadius: 3,
                        bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                        backdropFilter: darkMode ? 'blur(10px)' : 'none',
                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Title</TableCell>
                                    <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Department</TableCell>
                                    <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Type</TableCell>
                                    <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }} align="right">Price</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.recentBooks.map((book, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }}>{book.title}</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>{book.department}</TableCell>
                                        <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>{book.isPremium ? 'Premium' : 'Free'}</TableCell>
                                        <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }} align="right">
                                            {book.isPremium ? `₹${book.price}` : 'Free'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        );
    };

    const renderUserReport = () => {
        if (!reportData || !reportData.analytics) return null;

        return (
            <Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Users"
                            value={reportData.analytics.totalUsers}
                            icon={People}
                            color="#4f46e5"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Active Users"
                            value={reportData.analytics.activeUsers}
                            icon={People}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Suspended Users"
                            value={reportData.analytics.suspendedUsers}
                            icon={People}
                            color="#ef4444"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Pending Verifications"
                            value={reportData.analytics.pendingVerifications}
                            icon={People}
                            color="#f59e0b"
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const renderActivityReport = () => {
        if (!reportData || !reportData.popularBooks) return null;

        return (
            <TableContainer component={Paper} sx={{
                borderRadius: 3,
                bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>Book Title</TableCell>
                            <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }} align="right">Views</TableCell>
                            <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }} align="right">Downloads</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reportData.popularBooks.map((book, index) => (
                            <TableRow key={index}>
                                <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }}>{book.title}</TableCell>
                                <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }} align="right">{book.views || 0}</TableCell>
                                <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }} align="right">{book.downloads || 0}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 1 }}>
                        Reports 📊
                    </Typography>
                    <Typography variant="body1" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                        Generate and export comprehensive reports
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Print />}
                        onClick={handlePrint}
                        sx={{ borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
                    >
                        Print
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={exportToCSV}
                        sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
                    >
                        Export CSV
                    </Button>
                </Box>
            </Box>

            {/* Date Range Filters */}
            <Paper sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: darkMode ? 'white' : 'text.primary',
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: darkMode ? 'white' : 'text.primary',
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={fetchReportData}
                            sx={{ height: '56px', bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            Generate Report
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Report Tabs */}
            <Paper sx={{
                borderRadius: 3,
                bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                mb: 3
            }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                        borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                        '& .MuiTab-root': {
                            color: darkMode ? '#94a3b8' : 'text.secondary',
                            fontWeight: 600
                        },
                        '& .Mui-selected': {
                            color: '#4f46e5 !important'
                        }
                    }}
                >
                    <Tab label="Sales Report" />
                    <Tab label="Inventory Report" />
                    <Tab label="User Report" />
                    <Tab label="Activity Report" />
                </Tabs>
            </Paper>

            {/* Report Content */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : reportData ? (
                <Box>
                    {activeTab === 0 && renderSalesReport()}
                    {activeTab === 1 && renderInventoryReport()}
                    {activeTab === 2 && renderUserReport()}
                    {activeTab === 3 && renderActivityReport()}
                </Box>
            ) : (
                <Alert severity="info">
                    Select a date range and click "Generate Report" to view data
                </Alert>
            )}
        </Container>
    );
};

export default Reports;
