import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { DEPARTMENTS, SEMESTERS, API_URL } from '../../utils/constants';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    LinearProgress,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    MenuBook,
    CloudUpload,
    Close,
    AttachMoney,
    Image as ImageIcon,
    PictureAsPdf
} from '@mui/icons-material';

const BookManagement = () => {
    const { darkMode } = useOutletContext();
    const { currentUser } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [semesterFilter, setSemesterFilter] = useState('all');
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Edit book state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editBook, setEditBook] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [editCoverFile, setEditCoverFile] = useState(null);
    const [editPdfFile, setEditPdfFile] = useState(null);
    const [editCoverPreview, setEditCoverPreview] = useState(null);

    // Delete confirm dialog state
    const [delDialogOpen, setDelDialogOpen] = useState(false);
    const [deletingBook, setDeletingBook] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        isbn: '',
        department: '',
        semester: '',
        isPremium: false,
        price: 0,
        tags: '',
        featured: false
    });
    const [coverImage, setCoverImage] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            // Get Firebase token
            const token = currentUser ? await currentUser.getIdToken() : null;
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(`${API_URL}/books/`, { headers });
            const data = await response.json();
            setBooks(data.books || []);
        } catch (error) {
            console.error('Error fetching books:', error);
            showSnackbar('Error fetching books', 'error');
        } finally {
            setLoading(false);
        }
    };

    const generateISBN = (deptCode) => {
        const year = '2026';
        const random6 = Math.floor(100000 + Math.random() * 900000).toString();
        return `${deptCode.toUpperCase()}${year}${random6}`;
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        const newVal = type === 'checkbox' ? checked : value;
        setFormData(prev => ({
            ...prev,
            [name]: newVal,
            // Auto-generate ISBN when department changes
            ...(name === 'department' && value ? { isbn: generateISBN(value) } : {})
        }));
    };

    const handleRegenerateISBN = () => {
        if (formData.department) {
            setFormData(prev => ({ ...prev, isbn: generateISBN(formData.department) }));
        }
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showSnackbar('Cover image must be less than 2MB', 'error');
                return;
            }
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handlePdfFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 25 * 1024 * 1024) {
                showSnackbar('PDF file too large! Maximum allowed PDF size is 25 MB. Please compress or split your PDF.', 'error');
                return;
            }
            setPdfFile(file);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.title || !formData.author || !formData.department || !formData.semester) {
            showSnackbar('Please fill in all required fields', 'error');
            return;
        }
        if (!coverImage || !pdfFile) {
            showSnackbar('Please upload both cover image and PDF file', 'error');
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);

            // Create FormData
            const uploadData = new FormData();
            uploadData.append('title', formData.title);
            uploadData.append('author', formData.author);
            uploadData.append('description', formData.description);
            uploadData.append('isbn', formData.isbn);
            uploadData.append('department', formData.department);
            uploadData.append('semester', formData.semester);
            uploadData.append('isPremium', formData.isPremium);
            uploadData.append('price', formData.price);
            uploadData.append('tags', formData.tags);
            uploadData.append('featured', formData.featured);
            uploadData.append('coverImage', coverImage);
            uploadData.append('pdfFile', pdfFile);

            // Upload to backend
            // Get Firebase token
            const token = currentUser ? await currentUser.getIdToken() : null;
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(`${API_URL}/books/upload/`, {
                method: 'POST',
                headers,
                body: uploadData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const result = await response.json();
            showSnackbar('Book uploaded successfully!', 'success');

            // Reset form and close dialog
            resetForm();
            setOpenAddDialog(false);

            // Refresh book list
            fetchBooks();

        } catch (error) {
            console.error('Upload error:', error);
            showSnackbar(error.message || 'Failed to upload book', 'error');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteBook = (book) => {
        setDeletingBook(book);
        setDelDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingBook) return;
        try {
            setDeleting(true);
            const token = currentUser ? await currentUser.getIdToken() : null;
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(`${API_URL}/books/${deletingBook.id}/delete/`, {
                method: 'DELETE',
                headers,
            });
            if (!response.ok) throw new Error('Delete failed');
            showSnackbar(`"${deletingBook.title}" deleted permanently`, 'success');
            setDelDialogOpen(false);
            setDeletingBook(null);
            fetchBooks();
        } catch (error) {
            showSnackbar('Failed to delete book', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const handleOpenEdit = (book) => {
        setEditBook(book);
        setEditFormData({
            title: book.title || '',
            author: book.author || '',
            description: book.description || '',
            isbn: book.isbn || '',
            department: book.department || '',
            semester: book.semester || '',
            isPremium: book.isPremium || false,
            price: book.price || 0,
            tags: Array.isArray(book.tags) ? book.tags.join(', ') : (book.tags || ''),
            featured: book.featured || false,
        });
        setEditCoverFile(null);
        setEditPdfFile(null);
        setEditCoverPreview(null);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editFormData.title.trim() || !editFormData.author.trim()) {
            showSnackbar('Title and Author are required', 'error');
            return;
        }
        try {
            setEditSaving(true);
            const token = currentUser ? await currentUser.getIdToken() : null;
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const fd = new FormData();
            Object.entries(editFormData).forEach(([k, v]) => fd.append(k, v));
            if (editCoverFile) fd.append('coverImage', editCoverFile);
            if (editPdfFile) fd.append('pdfFile', editPdfFile);
            const response = await fetch(`${API_URL}/books/${editBook.id}/update/`, {
                method: 'PUT',
                headers,
                body: fd,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Update failed');
            showSnackbar('Book updated successfully!', 'success');
            setEditDialogOpen(false);
            fetchBooks();
        } catch (err) {
            showSnackbar(err.message || 'Failed to update book', 'error');
        } finally {
            setEditSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            description: '',
            isbn: '',
            department: '',
            semester: '',
            isPremium: false,
            price: 0,
            tags: '',
            featured: false
        });
        setCoverImage(null);
        setPdfFile(null);
        setCoverPreview(null);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.isbn?.includes(searchQuery);
        const matchesDept = departmentFilter === 'all' || book.department === departmentFilter;
        const matchesSem = semesterFilter === 'all' || book.semester === semesterFilter;
        return matchesSearch && matchesDept && matchesSem;
    });

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            {/* Header */}
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
                        Book Management
                    </Typography>
                    <Typography variant="body1" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                        Manage library inventory, add new books, and update details.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenAddDialog(true)}
                    sx={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                        boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
                        borderRadius: 2,
                        fontWeight: 'bold',
                        px: 3,
                        py: 1.5,
                        textTransform: 'none'
                    }}
                >
                    Add New Book
                </Button>
            </Box>

            {/* Filters & Search */}
            <Card sx={{
                borderRadius: 4,
                mb: 4,
                bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search by Title, Author, or ISBN..."
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
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>Department</InputLabel>
                                <Select
                                    value={departmentFilter}
                                    label="Department"
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                    sx={{
                                        color: darkMode ? 'white' : 'text.primary',
                                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
                                    }}
                                >
                                    <MenuItem value="all">All Departments</MenuItem>
                                    {DEPARTMENTS.map(dept => (
                                        <MenuItem key={dept.code} value={dept.code}>{dept.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>Semester</InputLabel>
                                <Select
                                    value={semesterFilter}
                                    label="Semester"
                                    onChange={(e) => setSemesterFilter(e.target.value)}
                                    sx={{
                                        color: darkMode ? 'white' : 'text.primary',
                                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
                                    }}
                                >
                                    <MenuItem value="all">All Semesters</MenuItem>
                                    {SEMESTERS.map(sem => (
                                        <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Books Table */}
            <TableContainer component={Paper} sx={{
                borderRadius: 4,
                bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc' }}>
                            <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 'bold' }}>Cover</TableCell>
                            <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 'bold' }}>Title</TableCell>
                            <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 'bold' }}>Author</TableCell>
                            <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 'bold' }}>Dept</TableCell>
                            <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 'bold' }}>Sem</TableCell>
                            <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredBooks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4, color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                    No books found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBooks.map((book) => (
                                <TableRow key={book.id} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc' } }}>
                                    <TableCell>
                                        <Box
                                            component="img"
                                            src={book.coverImageUrl}
                                            alt={book.title}
                                            sx={{
                                                width: 40,
                                                height: 56,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 600 }}>
                                        {book.title}
                                    </TableCell>
                                    <TableCell sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                        {book.author}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={book.department} size="small" sx={{ bgcolor: '#4f46e5', color: 'white' }} />
                                    </TableCell>
                                    <TableCell sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                        {book.semester}
                                    </TableCell>
                                    <TableCell>
                                        {book.isPremium ? (
                                            <Chip
                                                label={`₹${book.price}`}
                                                size="small"
                                                icon={<AttachMoney sx={{ fontSize: 16 }} />}
                                                sx={{
                                                    bgcolor: '#fbbf24',
                                                    color: '#78350f',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        ) : (
                                            <Chip label="Free" size="small" sx={{ bgcolor: '#10b981', color: 'white' }} />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit Book">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenEdit(book)}
                                                sx={{ color: '#4f46e5' }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Permanently">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteBook(book)}
                                                sx={{ color: '#ef4444' }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Book Dialog */}
            <Dialog
                open={openAddDialog}
                onClose={() => !uploading && setOpenAddDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        bgcolor: darkMode ? '#1e293b' : 'white',
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: darkMode ? 'white' : 'text.primary',
                    fontWeight: 'bold'
                }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <MenuBook sx={{ color: '#4f46e5' }} />
                        Add New Book
                    </Box>
                    <IconButton onClick={() => !uploading && setOpenAddDialog(false)} disabled={uploading}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={3}>
                        {/* Basic Info */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 2, fontWeight: 'bold' }}>
                                Basic Information
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Title *"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                disabled={uploading}
                                sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Author *"
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                disabled={uploading}
                                sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                multiline
                                rows={3}
                                disabled={uploading}
                                sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="ISBN (Auto-generated)"
                                name="isbn"
                                value={formData.isbn}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip title={formData.department ? 'Regenerate ISBN' : 'Select a department first'}>
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={handleRegenerateISBN}
                                                        disabled={!formData.department || uploading}
                                                        sx={{ color: '#9333ea' }}
                                                    >
                                                        <span style={{ fontSize: 18 }}>&#x21bb;</span>
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                }}
                                helperText={formData.department ? '' : 'Select a department to auto-generate'}
                                disabled={uploading}
                                sx={{
                                    '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary', fontWeight: 600, letterSpacing: 1 },
                                    '& .MuiFormHelperText-root': { color: '#f59e0b' }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Tags (comma separated)"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="algorithms, data-structures"
                                disabled={uploading}
                                sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary' } }}
                            />
                        </Grid>

                        {/* Category */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 2, fontWeight: 'bold' }}>
                                Category
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Department *</InputLabel>
                                <Select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    label="Department *"
                                    disabled={uploading}
                                    sx={{ color: darkMode ? 'white' : 'text.primary' }}
                                >
                                    {DEPARTMENTS.map(dept => (
                                        <MenuItem key={dept.code} value={dept.code}>{dept.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Semester *</InputLabel>
                                <Select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    label="Semester *"
                                    disabled={uploading}
                                    sx={{ color: darkMode ? 'white' : 'text.primary' }}
                                >
                                    {SEMESTERS.map(sem => (
                                        <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Pricing */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 2, fontWeight: 'bold' }}>
                                Pricing
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="isPremium"
                                        checked={formData.isPremium}
                                        onChange={handleInputChange}
                                        disabled={uploading}
                                    />
                                }
                                label="Premium Book"
                                sx={{ color: darkMode ? 'white' : 'text.primary' }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Price (₹)"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleInputChange}
                                disabled={!formData.isPremium || uploading}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                                sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary' } }}
                            />
                        </Grid>

                        {/* Files */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mb: 2, fontWeight: 'bold' }}>
                                Files
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<ImageIcon />}
                                disabled={uploading}
                                sx={{
                                    height: 120,
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                                    color: darkMode ? 'white' : 'text.primary',
                                    flexDirection: 'column',
                                    gap: 1
                                }}
                            >
                                {coverPreview ? (
                                    <Box
                                        component="img"
                                        src={coverPreview}
                                        alt="Cover preview"
                                        sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <>
                                        <CloudUpload />
                                        <Typography variant="caption">Upload Cover Image</Typography>
                                        <Typography variant="caption" sx={{ fontSize: 10 }}>Max 2MB</Typography>
                                    </>
                                )}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                />
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<PictureAsPdf />}
                                disabled={uploading}
                                sx={{
                                    height: 120,
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                                    color: darkMode ? 'white' : 'text.primary',
                                    flexDirection: 'column',
                                    gap: 1
                                }}
                            >
                                {pdfFile ? (
                                    <>
                                        <PictureAsPdf sx={{ fontSize: 40, color: '#ef4444' }} />
                                        <Typography variant="caption">{pdfFile.name}</Typography>
                                        <Typography variant="caption" sx={{ fontSize: 10 }}>
                                            {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <CloudUpload />
                                        <Typography variant="caption">Upload PDF File</Typography>
                                        <Typography variant="caption" sx={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>Max size: 25 MB</Typography>
                                    </>
                                )}
                                <input
                                    type="file"
                                    hidden
                                    accept="application/pdf"
                                    onChange={handlePdfFileChange}
                                />
                            </Button>
                        </Grid>

                        {/* Featured */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                        disabled={uploading}
                                    />
                                }
                                label="Feature on Landing Page"
                                sx={{ color: darkMode ? 'white' : 'text.primary' }}
                            />
                        </Grid>

                        {/* Upload Progress */}
                        {uploading && (
                            <Grid item xs={12}>
                                <LinearProgress variant="indeterminate" />
                                <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mt: 1 }}>
                                    Uploading book...
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAddDialog(false)} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={uploading}
                        sx={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                            fontWeight: 'bold',
                            px: 3
                        }}
                    >
                        {uploading ? 'Uploading...' : 'Upload Book'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Book Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => !editSaving && setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, bgcolor: darkMode ? '#1e293b' : 'white', backgroundImage: 'none' } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: darkMode ? 'white' : 'text.primary', fontWeight: 'bold' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Edit sx={{ color: '#4f46e5' }} />
                        Edit Book
                    </Box>
                    <IconButton onClick={() => !editSaving && setEditDialogOpen(false)} disabled={editSaving}><Close /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12}><Typography variant="subtitle2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 'bold' }}>Basic Information</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Title *" value={editFormData.title || ''}
                                onChange={(e) => setEditFormData(p => ({ ...p, title: e.target.value }))}
                                disabled={editSaving} sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary' } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Author *" value={editFormData.author || ''}
                                onChange={(e) => setEditFormData(p => ({ ...p, author: e.target.value }))}
                                disabled={editSaving} sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary' } }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Description" value={editFormData.description || ''}
                                onChange={(e) => setEditFormData(p => ({ ...p, description: e.target.value }))}
                                multiline rows={3} disabled={editSaving}
                                sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary' } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="ISBN" value={editFormData.isbn || ''}
                                onChange={(e) => setEditFormData(p => ({ ...p, isbn: e.target.value }))}
                                disabled={editSaving} sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary', fontWeight: 600, letterSpacing: 1 } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Tags (comma separated)" value={editFormData.tags || ''}
                                onChange={(e) => setEditFormData(p => ({ ...p, tags: e.target.value }))}
                                disabled={editSaving} sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary' } }} />
                        </Grid>

                        <Grid item xs={12}><Typography variant="subtitle2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 'bold' }}>Category</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Department *</InputLabel>
                                <Select value={editFormData.department || ''} label="Department *" disabled={editSaving}
                                    onChange={(e) => setEditFormData(p => ({ ...p, department: e.target.value }))}
                                    sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                    {DEPARTMENTS.map(d => <MenuItem key={d.code} value={d.code}>{d.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Semester *</InputLabel>
                                <Select value={editFormData.semester || ''} label="Semester *" disabled={editSaving}
                                    onChange={(e) => setEditFormData(p => ({ ...p, semester: e.target.value }))}
                                    sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                                    {SEMESTERS.map(s => <MenuItem key={s} value={s}>Semester {s}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}><Typography variant="subtitle2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 'bold' }}>Pricing</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={<Switch checked={!!editFormData.isPremium} disabled={editSaving}
                                    onChange={(e) => setEditFormData(p => ({ ...p, isPremium: e.target.checked }))} />}
                                label="Premium Book" sx={{ color: darkMode ? 'white' : 'text.primary' }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Price (₹)" type="number" value={editFormData.price || 0}
                                onChange={(e) => setEditFormData(p => ({ ...p, price: e.target.value }))}
                                disabled={!editFormData.isPremium || editSaving}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                sx={{ '& .MuiInputBase-input': { color: darkMode ? 'white' : 'text.primary' } }} />
                        </Grid>

                        <Grid item xs={12}><Typography variant="subtitle2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontWeight: 'bold' }}>Replace Files (optional)</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <Button variant="outlined" component="label" fullWidth startIcon={<ImageIcon />} disabled={editSaving}
                                sx={{ height: 90, borderStyle: 'dashed', borderWidth: 2, borderColor: darkMode ? 'rgba(255,255,255,0.2)' : undefined, color: darkMode ? 'white' : 'text.primary', flexDirection: 'column', gap: 0.5 }}>
                                {editCoverPreview
                                    ? <Box component="img" src={editCoverPreview} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    : <><CloudUpload /><Typography variant="caption">{editCoverFile ? editCoverFile.name : 'Replace Cover Image (optional)'}</Typography></>}
                                <input type="file" hidden accept="image/*" onChange={(e) => {
                                    const f = e.target.files[0];
                                    if (f) { if (f.size > 2 * 1024 * 1024) { showSnackbar('Max 2MB for cover', 'error'); return; } setEditCoverFile(f); setEditCoverPreview(URL.createObjectURL(f)); }
                                }} />
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button variant="outlined" component="label" fullWidth startIcon={<PictureAsPdf />} disabled={editSaving}
                                sx={{ height: 90, borderStyle: 'dashed', borderWidth: 2, borderColor: darkMode ? 'rgba(255,255,255,0.2)' : undefined, color: darkMode ? 'white' : 'text.primary', flexDirection: 'column', gap: 0.5 }}>
                                {editPdfFile ? <><PictureAsPdf sx={{ fontSize: 32, color: '#ef4444' }} /><Typography variant="caption">{editPdfFile.name}</Typography></>
                                    : <><CloudUpload /><Typography variant="caption">Replace PDF (optional — Max 25MB)</Typography></>}
                                <input type="file" hidden accept="application/pdf" onChange={(e) => {
                                    const f = e.target.files[0];
                                    if (f) { if (f.size > 25 * 1024 * 1024) { showSnackbar('PDF max 25MB', 'error'); return; } setEditPdfFile(f); }
                                }} />
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={!!editFormData.featured} disabled={editSaving}
                                    onChange={(e) => setEditFormData(p => ({ ...p, featured: e.target.checked }))} />}
                                label="Feature on Landing Page" sx={{ color: darkMode ? 'white' : 'text.primary' }} />
                        </Grid>
                        {editSaving && <Grid item xs={12}><LinearProgress /></Grid>}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={editSaving}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEdit} disabled={editSaving}
                        startIcon={editSaving ? <CircularProgress size={16} color="inherit" /> : <Edit />}
                        sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)', fontWeight: 'bold', px: 3 }}>
                        {editSaving ? 'Saving…' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog
                open={delDialogOpen}
                onClose={() => !deleting && setDelDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { bgcolor: darkMode ? '#1e293b' : 'white', borderRadius: 3 } }}
            >
                <DialogTitle sx={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Delete /> Delete Book Permanently
                </DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        This action <strong>cannot be undone</strong>. The book record AND all stored files (PDF + cover image) will be permanently removed from the database.
                    </Alert>
                    <Typography sx={{ color: darkMode ? 'white' : 'text.primary', fontWeight: 600 }}>
                        📖 {deletingBook?.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', mt: 0.5 }}>
                        by {deletingBook?.author}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setDelDialogOpen(false)} disabled={deleting} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirmDelete} disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Delete />}
                        sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, fontWeight: 700 }}>
                        {deleting ? 'Deleting…' : 'Delete Permanently'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default BookManagement;
