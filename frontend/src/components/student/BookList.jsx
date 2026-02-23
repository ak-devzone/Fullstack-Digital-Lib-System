import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import BookCard from './BookCard';
import BookDetails from './BookDetails';
import { API_URL } from '../../utils/constants';
import {
    Container,
    Typography,
    Box,
    Grid,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';

const BookList = () => {
    const { department, semester } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // all, free, premium
    const [sortBy, setSortBy] = useState('latest'); // latest, title, price
    const [selectedBook, setSelectedBook] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        fetchBooks();
    }, [department, semester]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (department) params.append('department', department);
            if (semester) params.append('semester', semester);

            const response = await fetch(`${API_URL}/books/?${params.toString()}`);
            const data = await response.json();
            setBooks(data.books || []);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBooks = books
        .filter(book => {
            // Search filter
            const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author?.toLowerCase().includes(searchQuery.toLowerCase());

            // Type filter
            const matchesType = typeFilter === 'all' ||
                (typeFilter === 'free' && !book.isPremium) ||
                (typeFilter === 'premium' && book.isPremium);

            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            } else if (sortBy === 'price') {
                return (a.price || 0) - (b.price || 0);
            }
            // Default: latest (assuming uploadedAt exists)
            return 0;
        });

    const handleBookClick = (book) => {
        setSelectedBook(book);
        setDetailsOpen(true);
    };

    const handleReadNow = (book) => {
        // Navigate to book reader
        navigate(`/book/${book.id}`);
    };

    const handleBuyNow = (book) => {
        // TODO: Implement payment flow
        alert(`Payment integration coming soon! Book: ${book.title}, Price: ₹${book.price}`);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 1 }}>
                    {department && semester ? (
                        <>
                            {department} - Semester {semester} Books
                        </>
                    ) : (
                        'All Books'
                    )}
                </Typography>
                <Typography variant="body1" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                    Browse and access your course materials
                </Typography>
            </Box>

            {/* Filters */}
            <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by title or author..."
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
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>Type</InputLabel>
                            <Select
                                value={typeFilter}
                                label="Type"
                                onChange={(e) => setTypeFilter(e.target.value)}
                                sx={{
                                    color: darkMode ? 'white' : 'text.primary',
                                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
                                }}
                            >
                                <MenuItem value="all">All Books</MenuItem>
                                <MenuItem value="free">Free Only</MenuItem>
                                <MenuItem value="premium">Premium Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sort By"
                                onChange={(e) => setSortBy(e.target.value)}
                                sx={{
                                    color: darkMode ? 'white' : 'text.primary',
                                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
                                }}
                            >
                                <MenuItem value="latest">Latest First</MenuItem>
                                <MenuItem value="title">Title (A-Z)</MenuItem>
                                <MenuItem value="price">Price (Low to High)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Results Count */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                        Showing {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
                    </Typography>
                </Box>
            </Box>

            {/* Books Grid */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : filteredBooks.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                    No books found. Try adjusting your filters or search query.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {filteredBooks.map((book) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                            <BookCard
                                book={book}
                                onClick={() => handleBookClick(book)}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Book Details Dialog */}
            <BookDetails
                book={selectedBook}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                onReadNow={handleReadNow}
                onBuyNow={handleBuyNow}
            />
        </Container>
    );
};

export default BookList;
