import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { API_URL } from '../../utils/constants';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Button,
    IconButton,
    Paper,
    AppBar,
    Toolbar,
    TextField
} from '@mui/material';
import {
    ArrowBack,
    ZoomIn,
    ZoomOut,
    Lock,
    NavigateBefore,
    NavigateNext,
    Warning
} from '@mui/icons-material';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const BookReader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { darkMode: userDarkMode } = useTheme();
    // User wants book reader to ALWAYS be in dark mode
    const darkMode = true;

    // Helper to ensure URLs use HTTPS in production
    const ensureHttps = (url) => {
        if (!url) return url;
        if (url.startsWith('http://djangobackendapi.up.railway.app')) {
            return url.replace('http://', 'https://');
        }
        return url;
    };

    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [accessReason, setAccessReason] = useState('');
    const [book, setBook] = useState(null);
    const [error, setError] = useState(null);

    // PDF State
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    useEffect(() => {
        if (id) {
            checkAccessAndLoadBook();
        } else {
            setError("Invalid Book ID");
            setLoading(false);
        }
    }, [id]);

    // Trigger alert if access denied due to missing ID
    useEffect(() => {
        if (!loading && !hasAccess && accessReason === 'missing_id_proof') {
            alert("Please upload your ID proof to access this book.");
        }
    }, [loading, hasAccess, accessReason]);

    const checkAccessAndLoadBook = async () => {
        console.log("Loading book with ID:", id);
        try {
            setLoading(true);
            setError(null);

            // Get Auth Token if logged in
            let token = null;
            if (currentUser) {
                token = await currentUser.getIdToken();
            }

            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            // First, get book details
            const bookResponse = await fetch(`${API_URL}/books/${id}/`, { headers });
            if (!bookResponse.ok) {
                const errData = await bookResponse.json().catch(() => ({}));
                console.error("Book fetch failed:", bookResponse.status, errData);
                throw new Error(errData.error || 'Book not found');
            }
            const bookData = await bookResponse.json();
            setBook(bookData.book);

            // Check access
            const accessResponse = await fetch(`${API_URL}/books/${id}/access/`, { headers });

            if (!accessResponse.ok) {
                throw new Error('Failed to verify access');
            }

            const accessData = await accessResponse.json();
            setHasAccess(accessData.hasAccess);
            setAccessReason(accessData.reason);

        } catch (err) {
            console.error('Error loading book:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const changePage = (offset) => {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    };

    const previousPage = () => {
        changePage(-1);
    };

    const nextPage = () => {
        changePage(1);
    };

    const zoomIn = () => {
        setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
    };

    const zoomOut = () => {
        setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
    };



    const handleBuyBook = () => {
        navigate(`/books/${book.department}/${book.semester}`);
    };

    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: darkMode ? '#0f172a' : '#f8fafc'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                    {error}
                </Alert>
                <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{ mt: 2 }}
                >
                    Go Back
                </Button>
            </Container>
        );
    }

    // Access Denied - Missing ID Proof
    if (!hasAccess && accessReason === 'missing_id_proof') {
        const handleRedirect = () => {
            navigate('/profile', { state: { returnUrl: location.pathname } });
        };



        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: darkMode ? '#0f172a' : '#f8fafc',
                p: 3
            }}>
                <Paper sx={{
                    maxWidth: 500,
                    p: 5,
                    textAlign: 'center',
                    borderRadius: 4,
                    bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                    backdropFilter: darkMode ? 'blur(10px)' : '',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                }}>
                    <Warning sx={{ fontSize: 80, color: '#f59e0b', mb: 3 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 2 }}>
                        Action Required
                    </Typography>
                    <Typography variant="body1" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 4 }}>
                        Please upload your ID proof to access books.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleRedirect}
                        sx={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    >
                        Upload ID Proof
                    </Button>
                </Paper>
            </Box>
        );
    }

    // Access Denied - Premium book not purchased
    if (!hasAccess) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: darkMode ? '#0f172a' : '#f8fafc',
                p: 3
            }}>
                <Paper sx={{
                    maxWidth: 500,
                    p: 5,
                    textAlign: 'center',
                    borderRadius: 4,
                    bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                    backdropFilter: darkMode ? 'blur(10px)' : 'none',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                }}>
                    <Lock sx={{ fontSize: 80, color: '#fbbf24', mb: 3 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 2 }}>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 4 }}>
                        This is a premium book. Please purchase it to access the content.
                    </Typography>
                    {book && (
                        <Box sx={{ mb: 4, p: 3, bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: darkMode ? 'white' : 'text.primary', mb: 1 }}>
                                {book.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 2 }}>
                                by {book.author}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fbbf24' }}>
                                ₹{book.price}
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            sx={{ color: darkMode ? 'white' : 'text.primary' }}
                        >
                            Go Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleBuyBook}
                            sx={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                color: '#78350f',
                                fontWeight: 'bold'
                            }}
                        >
                            Buy Now
                        </Button>
                    </Box>
                </Paper>
            </Box>
        );
    }

    // Access Granted - Display PDF
    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: darkMode ? '#0f172a' : '#f8fafc',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
            }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Reader Toolbar */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    color: darkMode ? 'white' : 'text.primary'
                }}
            >
                <Toolbar>
                    <IconButton
                        edge="start"
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2, color: darkMode ? 'white' : 'text.primary' }}
                    >
                        <ArrowBack />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {book?.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                            {book?.author}
                        </Typography>
                    </Box>

                    {/* PDF Controls */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <IconButton
                            onClick={zoomOut}
                            disabled={scale <= 0.5}
                            sx={{ color: darkMode ? 'white' : 'text.primary' }}
                            title="Zoom Out"
                        >
                            <ZoomOut />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
                            {Math.round(scale * 100)}%
                        </Typography>
                        <IconButton
                            onClick={zoomIn}
                            disabled={scale >= 3.0}
                            sx={{ color: darkMode ? 'white' : 'text.primary' }}
                            title="Zoom In"
                        >
                            <ZoomIn />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* PDF Viewer Container */}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    {/* Page Navigation */}
                    {numPages && (
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                            backdropFilter: darkMode ? 'blur(10px)' : 'none',
                            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: 3,
                            p: 2
                        }}>
                            <IconButton
                                onClick={previousPage}
                                disabled={pageNumber <= 1}
                                sx={{ color: darkMode ? 'white' : 'text.primary' }}
                            >
                                <NavigateBefore />
                            </IconButton>
                            <Typography variant="body1" sx={{ color: darkMode ? 'white' : 'text.primary', minWidth: 120 }}>
                                Page {pageNumber} of {numPages}
                            </Typography>
                            <IconButton
                                onClick={nextPage}
                                disabled={pageNumber >= numPages}
                                sx={{ color: darkMode ? 'white' : 'text.primary' }}
                            >
                                <NavigateNext />
                            </IconButton>
                        </Box>
                    )}
                </Box>

                {/* PDF Document */}
                <Paper sx={{
                    borderRadius: 3,
                    bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                    backdropFilter: darkMode ? 'blur(10px)' : 'none',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    p: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    overflow: 'auto',
                    '& .react-pdf__Page__textContent': {
                        display: 'none !important'
                    },
                    '& .react-pdf__Page__annotations': {
                        display: 'none !important'
                    }
                }}>
                    <Document
                        file={ensureHttps(book?.pdfUrl)}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <Box sx={{ py: 8, textAlign: 'center' }}>
                                <CircularProgress />
                                <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mt: 2 }}>
                                    Loading PDF...
                                </Typography>
                            </Box>
                        }
                        error={
                            <Alert severity="error" sx={{ m: 4 }}>
                                Failed to load PDF. Please try again later.
                            </Alert>
                        }
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </Document>
                </Paper>
            </Container>
        </Box>
    );
};

export default BookReader;
