import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Box, Container, Typography, TextField, InputAdornment, Grid,
    FormControl, InputLabel, Select, MenuItem, Chip, Card, CardContent,
    CardMedia, Button, CircularProgress, Paper, IconButton, Tooltip,
    Divider, Badge
} from '@mui/material';
import {
    Search as SearchIcon, FilterList, Clear, MenuBook,
    Star, Lock, LockOpen, Sort, TrendingUp, Refresh
} from '@mui/icons-material';
import { DEPARTMENTS, SEMESTERS, API_URL } from '../../utils/constants';
import BookDetails from './BookDetails';

/* ── colour palette matching the app's dark theme ─────────────────────────── */
const G = {
    bg: '#0f172a',
    surface: 'rgba(30,41,59,0.75)',
    border: 'rgba(255,255,255,0.08)',
    accent: '#9333ea',
    accent2: '#d946ef',
    cyan: '#22d3ee',
    text: '#f1f5f9',
    muted: '#94a3b8',
};

/* ── single book result card ──────────────────────────────────────────────── */
const ResultCard = ({ book, onClick, index }) => {
    const [hov, setHov] = useState(false);
    const colors = ['#9333ea', '#d946ef', '#22d3ee', '#f472b6', '#fb923c', '#34d399'];
    const c = colors[index % colors.length];
    return (
        <Card
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            onClick={() => onClick(book)}
            sx={{
                cursor: 'pointer', height: '100%',
                bgcolor: hov ? 'rgba(147,51,234,.08)' : G.surface,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${hov ? c + '55' : G.border}`,
                borderRadius: '16px', overflow: 'hidden',
                transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                transform: hov ? 'translateY(-6px) scale(1.01)' : 'none',
                boxShadow: hov ? `0 20px 40px rgba(0,0,0,.4), 0 0 30px ${c}22` : '0 4px 16px rgba(0,0,0,.2)',
                display: 'flex', flexDirection: 'column',
            }}
        >
            {/* Cover */}
            <Box sx={{ position: 'relative', height: 180, overflow: 'hidden', background: `linear-gradient(135deg, ${c}22, ${c}08)`, flexShrink: 0 }}>
                {book.coverImageUrl
                    ? <CardMedia component="img" image={book.coverImageUrl} alt={book.title}
                        sx={{ height: '100%', objectFit: 'cover', transition: 'transform .5s ease', transform: hov ? 'scale(1.07)' : 'scale(1)' }} />
                    : <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>📖</Box>
                }
                {/* Premium badge */}
                {book.isPremium && (
                    <Chip label={`₹${book.price}`} size="small" icon={<Lock sx={{ fontSize: 12, color: '#78350f !important' }} />}
                        sx={{ position: 'absolute', top: 10, right: 10, bgcolor: '#fbbf24', color: '#78350f', fontWeight: 700, fontSize: '0.72rem' }} />
                )}
                {!book.isPremium && (
                    <Chip label="FREE" size="small" icon={<LockOpen sx={{ fontSize: 12, color: '#064e3b !important' }} />}
                        sx={{ position: 'absolute', top: 10, right: 10, bgcolor: '#10b981', color: '#064e3b', fontWeight: 700, fontSize: '0.72rem' }} />
                )}
            </Box>

            {/* Body */}
            <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ color: c, fontWeight: 700, fontSize: '0.7rem', letterSpacing: 1.5, textTransform: 'uppercase', mb: 0.5 }}>
                    {book.department || '—'} · Sem {book.semester || '—'}
                </Typography>
                <Typography sx={{ color: G.text, fontWeight: 700, fontSize: '0.97rem', lineHeight: 1.35, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {book.title}
                </Typography>
                <Typography sx={{ color: G.muted, fontSize: '0.82rem', mb: 'auto' }}>by {book.author}</Typography>
                {book.fileSize && (
                    <Typography sx={{ color: '#475569', fontSize: '0.72rem', mt: 1 }}>📁 {book.fileSize}</Typography>
                )}
            </CardContent>
        </Card>
    );
};

/* ══════════════ MAIN SEARCH PAGE ══════════════════════════════════════════ */
const Search = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { darkMode } = useTheme();

    // Pull any ?q= from URL
    const urlParams = new URLSearchParams(location.search);
    const [query, setQuery] = useState(urlParams.get('q') || '');
    const [department, setDepartment] = useState(urlParams.get('dept') || '');
    const [semester, setSemester] = useState(urlParams.get('sem') || '');
    const [type, setType] = useState('all');   // all | free | premium
    const [sort, setSort] = useState('latest');// latest | title | price

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [total, setTotal] = useState(0);

    const [selectedBook, setSelectedBook] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const debounceRef = useRef(null);

    /* ── fetch from backend ── */
    const fetchBooks = useCallback(async (q, dept, sem) => {
        setLoading(true);
        setSearched(true);
        try {
            const params = new URLSearchParams();
            if (q) params.set('search', q);
            if (dept) params.set('department', dept);
            if (sem) params.set('semester', sem);

            const token = currentUser ? await currentUser.getIdToken() : null;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await fetch(`${API_URL}/books/?${params.toString()}`, { headers });
            const data = await res.json();
            setBooks(data.books || []);
            setTotal((data.books || []).length);
        } catch (err) {
            console.error('Search error:', err);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    /* ── auto-search when component mounts with URL params ── */
    useEffect(() => {
        if (query || department || semester) {
            fetchBooks(query, department, semester);
        }
    }, []); // eslint-disable-line

    /* ── debounced search on any filter change ── */
    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (!query && !department && !semester) { setBooks([]); setSearched(false); return; }
        debounceRef.current = setTimeout(() => {
            fetchBooks(query, department, semester);
        }, 380);
        return () => clearTimeout(debounceRef.current);
    }, [query, department, semester]); // eslint-disable-line

    /* ── client-side filter + sort on the fetched list ── */
    const displayed = books
        .filter(b => {
            if (type === 'free') return !b.isPremium;
            if (type === 'premium') return b.isPremium;
            return true;
        })
        .sort((a, b) => {
            if (sort === 'title') return (a.title || '').localeCompare(b.title || '');
            if (sort === 'price') return (a.price || 0) - (b.price || 0);
            return 0; // latest: server order
        });

    /* ── helpers ── */
    const handleClear = () => { setQuery(''); setDepartment(''); setSemester(''); setType('all'); setSort('latest'); setBooks([]); setSearched(false); };
    const handleBookClick = (book) => { setSelectedBook(book); setDetailsOpen(true); };

    const hasFilters = query || department || semester || type !== 'all' || sort !== 'latest';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: darkMode ? G.bg : '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

            {/* ── HERO SEARCH BAR ────────────────────────────────── */}
            <Box sx={{
                background: darkMode
                    ? 'linear-gradient(135deg, #0f0030 0%, #0a001a 50%, #001020 100%)'
                    : 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                pt: { xs: 6, md: 8 }, pb: { xs: 5, md: 7 }, px: 3,
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Background glows */}
                {darkMode && <>
                    <Box sx={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(147,51,234,.25) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                    <Box sx={{ position: 'absolute', bottom: -60, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,.15) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                </>}

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, fontWeight: 900, color: 'white', mb: 1, letterSpacing: '-1px' }}>
                        Search the Library
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,.65)', mb: 4, fontSize: '1rem' }}>
                        Find books by title, author, department or ISBN
                    </Typography>

                    {/* Main search input */}
                    <Paper elevation={0} sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        p: '8px 16px', borderRadius: '16px',
                        bgcolor: darkMode ? 'rgba(255,255,255,.07)' : 'white',
                        border: `1px solid ${darkMode ? 'rgba(255,255,255,.14)' : 'transparent'}`,
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,.3)',
                    }}>
                        <SearchIcon sx={{ color: G.accent, fontSize: 26, flexShrink: 0 }} />
                        <TextField
                            fullWidth variant="standard"
                            placeholder="Type a title, author, or ISBN…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                            InputProps={{ disableUnderline: true, sx: { fontSize: '1.05rem', color: darkMode ? 'white' : '#1e293b' } }}
                        />
                        {query && (
                            <IconButton size="small" onClick={() => setQuery('')} sx={{ color: G.muted }}>
                                <Clear fontSize="small" />
                            </IconButton>
                        )}
                        {loading && <CircularProgress size={22} sx={{ color: G.accent, flexShrink: 0 }} />}
                    </Paper>
                </Container>
            </Box>

            {/* ── FILTERS ROW ────────────────────────────────────── */}
            <Box sx={{
                bgcolor: darkMode ? 'rgba(15,23,42,.95)' : 'white',
                borderBottom: `1px solid ${darkMode ? G.border : '#e2e8f0'}`,
                py: 2, px: 3,
                position: 'sticky', top: 0, zIndex: 100,
                backdropFilter: 'blur(20px)',
            }}>
                <Container maxWidth="xl">
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: G.muted }}>Department</InputLabel>
                                <Select value={department} label="Department" onChange={e => setDepartment(e.target.value)}
                                    sx={{ color: darkMode ? G.text : 'text.primary', bgcolor: darkMode ? 'rgba(255,255,255,.05)' : 'white' }}>
                                    <MenuItem value=""><em>All Departments</em></MenuItem>
                                    {DEPARTMENTS.map(d => <MenuItem key={d.code} value={d.code}>{d.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: G.muted }}>Semester</InputLabel>
                                <Select value={semester} label="Semester" onChange={e => setSemester(e.target.value)}
                                    sx={{ color: darkMode ? G.text : 'text.primary', bgcolor: darkMode ? 'rgba(255,255,255,.05)' : 'white' }}>
                                    <MenuItem value=""><em>All</em></MenuItem>
                                    {SEMESTERS.map(s => <MenuItem key={s} value={String(s)}>Semester {s}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: G.muted }}>Type</InputLabel>
                                <Select value={type} label="Type" onChange={e => setType(e.target.value)}
                                    sx={{ color: darkMode ? G.text : 'text.primary', bgcolor: darkMode ? 'rgba(255,255,255,.05)' : 'white' }}>
                                    <MenuItem value="all">All Books</MenuItem>
                                    <MenuItem value="free">🟢 Free Only</MenuItem>
                                    <MenuItem value="premium">⭐ Premium Only</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: G.muted }}>Sort By</InputLabel>
                                <Select value={sort} label="Sort By" onChange={e => setSort(e.target.value)}
                                    sx={{ color: darkMode ? G.text : 'text.primary', bgcolor: darkMode ? 'rgba(255,255,255,.05)' : 'white' }}>
                                    <MenuItem value="latest">🕐 Latest</MenuItem>
                                    <MenuItem value="title">🔤 Title A–Z</MenuItem>
                                    <MenuItem value="price">💰 Price Low–High</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Active filter chips + clear */}
                        <Grid item xs={12} sm={12} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {department && <Chip label={department} size="small" onDelete={() => setDepartment('')} sx={{ bgcolor: G.accent + '33', color: G.accent, fontWeight: 600 }} />}
                            {semester && <Chip label={`Sem ${semester}`} size="small" onDelete={() => setSemester('')} sx={{ bgcolor: G.cyan + '22', color: G.cyan, fontWeight: 600 }} />}
                            {type !== 'all' && <Chip label={type} size="small" onDelete={() => setType('all')} sx={{ bgcolor: '#f59e0b22', color: '#f59e0b', fontWeight: 600, textTransform: 'capitalize' }} />}
                            {hasFilters && (
                                <Tooltip title="Clear all filters">
                                    <IconButton size="small" onClick={handleClear} sx={{ color: '#ef4444', border: '1px solid #ef444433', borderRadius: '8px' }}>
                                        <Clear fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ── RESULTS ────────────────────────────────────────── */}
            <Container maxWidth="xl" sx={{ py: 5 }}>

                {/* Stats bar */}
                {searched && !loading && (
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography sx={{ color: G.muted, fontSize: '0.9rem' }}>
                            {displayed.length === 0
                                ? 'No results found'
                                : <><Box component="span" sx={{ color: G.text, fontWeight: 700, fontSize: '1rem' }}>{displayed.length}</Box> {displayed.length === 1 ? 'book' : 'books'} found</>
                            }
                            {query && <Box component="span"> for "<Box component="span" sx={{ color: G.accent, fontWeight: 600 }}>{query}</Box>"</Box>}
                        </Typography>
                        <Tooltip title="Refresh results">
                            <IconButton size="small" onClick={() => fetchBooks(query, department, semester)} sx={{ color: G.muted }}>
                                <Refresh fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                {/* Loading spinner */}
                {loading && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
                        <CircularProgress size={48} sx={{ color: G.accent }} />
                        <Typography sx={{ color: G.muted }}>Searching library…</Typography>
                    </Box>
                )}

                {/* Empty state — initial */}
                {!loading && !searched && (
                    <Box sx={{ textAlign: 'center', py: 12 }}>
                        <Box sx={{ fontSize: 72, mb: 2 }}>🔍</Box>
                        <Typography sx={{ color: G.text, fontWeight: 700, fontSize: '1.5rem', mb: 1 }}>Start Your Search</Typography>
                        <Typography sx={{ color: G.muted, maxWidth: 400, mx: 'auto' }}>
                            Type a book title, author name, or ISBN above — or use the department and semester filters.
                        </Typography>

                        {/* Quick shortcut chips */}
                        <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
                            {DEPARTMENTS.map(d => (
                                <Chip key={d.code} label={d.name} clickable onClick={() => setDepartment(d.code)}
                                    sx={{ bgcolor: G.surface, color: G.text, border: `1px solid ${G.border}`, '&:hover': { bgcolor: G.accent + '22', borderColor: G.accent } }} />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Empty state — no results */}
                {!loading && searched && displayed.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Box sx={{ fontSize: 64, mb: 2 }}>📭</Box>
                        <Typography sx={{ color: G.text, fontWeight: 700, fontSize: '1.3rem', mb: 1 }}>No Books Found</Typography>
                        <Typography sx={{ color: G.muted, mb: 3 }}>
                            Try different keywords, remove some filters, or browse all books.
                        </Typography>
                        <Button variant="outlined" onClick={handleClear}
                            sx={{
                                borderColor: G.accent, color: G.accent, borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                                '&:hover': { bgcolor: G.accent + '22' }
                            }}>
                            Clear Filters
                        </Button>
                    </Box>
                )}

                {/* Results grid */}
                {!loading && displayed.length > 0 && (
                    <Grid container spacing={3}>
                        {displayed.map((book, i) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                                <ResultCard book={book} onClick={handleBookClick} index={i} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Book Details Dialog */}
            <BookDetails
                book={selectedBook}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                onReadNow={(book) => navigate(`/book/${book.id}`)}
                onBuyNow={(book) => alert(`Payment coming soon! Book: ${book.title} — ₹${book.price}`)}
            />
        </Box>
    );
};

export default Search;
