import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Chip,
    Grid,
    IconButton,
    Divider
} from '@mui/material';
import {
    Close,
    AttachMoney,
    MenuBook,
    Person,
    Category,
    School,
    Description
} from '@mui/icons-material';

const BookDetails = ({ book, open, onClose, onReadNow, onBuyNow }) => {
    const { darkMode } = useTheme();

    if (!book) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                fontWeight: 'bold',
                pb: 2
            }}>
                <Typography variant="h6" fontWeight="bold">
                    Book Details
                </Typography>
                <IconButton onClick={onClose} sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Cover Image */}
                    <Grid item xs={12} md={4}>
                        <Box
                            component="img"
                            src={book.coverImageUrl || '/placeholder-book.jpg'}
                            alt={book.title}
                            sx={{
                                width: '100%',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        />
                    </Grid>

                    {/* Book Info */}
                    <Grid item xs={12} md={8}>
                        {/* Premium/Free Badge */}
                        <Box sx={{ mb: 2 }}>
                            {book.isPremium ? (
                                <Chip
                                    label={`₹${book.price}`}
                                    icon={<AttachMoney />}
                                    sx={{
                                        bgcolor: '#fbbf24',
                                        color: '#78350f',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        px: 1
                                    }}
                                />
                            ) : (
                                <Chip
                                    label="Free"
                                    sx={{
                                        bgcolor: '#10b981',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        px: 1
                                    }}
                                />
                            )}
                        </Box>

                        {/* Title */}
                        <Typography variant="h4" sx={{ fontWeight: 800, color: darkMode ? 'white' : 'text.primary', mb: 1 }}>
                            {book.title}
                        </Typography>

                        {/* Author */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <Person sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', fontSize: 20 }} />
                            <Typography variant="body1" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary' }}>
                                by {book.author}
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 3, borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />

                        {/* Description */}
                        {book.description && (
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Description sx={{ color: '#4f46e5', fontSize: 20 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: darkMode ? 'white' : 'text.primary' }}>
                                        Description
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', lineHeight: 1.7 }}>
                                    {book.description}
                                </Typography>
                            </Box>
                        )}

                        {/* Category Info */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Category sx={{ color: '#4f46e5', fontSize: 20 }} />
                                <Chip
                                    label={book.department}
                                    size="small"
                                    sx={{
                                        bgcolor: darkMode ? 'rgba(79, 70, 229, 0.2)' : '#e0e7ff',
                                        color: '#4f46e5',
                                        fontWeight: 600
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <School sx={{ color: '#ec4899', fontSize: 20 }} />
                                <Chip
                                    label={`Semester ${book.semester}`}
                                    size="small"
                                    sx={{
                                        bgcolor: darkMode ? 'rgba(236, 72, 153, 0.2)' : '#fce7f3',
                                        color: '#ec4899',
                                        fontWeight: 600
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Additional Info */}
                        {book.isbn && (
                            <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', display: 'block', mb: 0.5 }}>
                                ISBN: {book.isbn}
                            </Typography>
                        )}
                        {book.fileSize && (
                            <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : 'text.secondary', display: 'block' }}>
                                File Size: {book.fileSize}
                            </Typography>
                        )}

                        {/* Tags */}
                        {book.tags && book.tags.length > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {book.tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                                            color: darkMode ? '#94a3b8' : 'text.secondary'
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button onClick={onClose} sx={{ color: darkMode ? 'white' : 'text.primary' }}>
                    Close
                </Button>
                {book.isPremium ? (
                    <Button
                        variant="contained"
                        startIcon={<AttachMoney />}
                        onClick={() => onBuyNow(book)}
                        sx={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: '#78350f',
                            fontWeight: 'bold',
                            px: 3,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            }
                        }}
                    >
                        Buy Now - ₹{book.price}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        startIcon={<MenuBook />}
                        onClick={() => onReadNow(book)}
                        sx={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                            fontWeight: 'bold',
                            px: 3
                        }}
                    >
                        Read Now
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default BookDetails;
