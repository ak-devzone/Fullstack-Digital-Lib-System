import { Card, CardContent, CardMedia, Typography, Box, Chip, Button } from '@mui/material';
import { AttachMoney, MenuBook } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const BookCard = ({ book, onClick }) => {
    const { darkMode } = useTheme();

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                bgcolor: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'white',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                boxShadow: darkMode
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: darkMode
                        ? '0 10px 20px -5px rgba(0, 0, 0, 0.5)'
                        : '0 10px 20px -5px rgba(0, 0, 0, 0.2)',
                }
            }}
            onClick={onClick}
        >
            {/* Cover Image */}
            <CardMedia
                component="img"
                height="280"
                image={book.coverImageUrl || '/placeholder-book.jpg'}
                alt={book.title}
                sx={{
                    objectFit: 'cover',
                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'
                }}
            />

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                {/* Premium/Free Badge */}
                <Box sx={{ mb: 1.5 }}>
                    {book.isPremium ? (
                        <Chip
                            label={`₹${book.price}`}
                            size="small"
                            icon={<AttachMoney sx={{ fontSize: 16 }} />}
                            sx={{
                                bgcolor: '#fbbf24',
                                color: '#78350f',
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                            }}
                        />
                    ) : (
                        <Chip
                            label="Free"
                            size="small"
                            sx={{
                                bgcolor: '#10b981',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                            }}
                        />
                    )}
                </Box>

                {/* Title */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: darkMode ? 'white' : 'text.primary',
                        mb: 0.5,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.6em'
                    }}
                >
                    {book.title}
                </Typography>

                {/* Author */}
                <Typography
                    variant="body2"
                    sx={{
                        color: darkMode ? '#94a3b8' : 'text.secondary',
                        mb: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    by {book.author}
                </Typography>

                {/* Department & Semester */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                        label={book.department}
                        size="small"
                        sx={{
                            bgcolor: darkMode ? 'rgba(79, 70, 229, 0.2)' : '#e0e7ff',
                            color: '#4f46e5',
                            fontSize: '0.7rem',
                            fontWeight: 600
                        }}
                    />
                    <Chip
                        label={`Sem ${book.semester}`}
                        size="small"
                        sx={{
                            bgcolor: darkMode ? 'rgba(236, 72, 153, 0.2)' : '#fce7f3',
                            color: '#ec4899',
                            fontSize: '0.7rem',
                            fontWeight: 600
                        }}
                    />
                </Box>

                {/* View Details Button */}
                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<MenuBook />}
                    sx={{
                        mt: 'auto',
                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : '#4f46e5',
                        color: darkMode ? 'white' : '#4f46e5',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                            borderColor: '#4f46e5',
                            bgcolor: darkMode ? 'rgba(79, 70, 229, 0.1)' : 'rgba(79, 70, 229, 0.05)',
                        }
                    }}
                >
                    View Details
                </Button>
            </CardContent>
        </Card>
    );
};

export default BookCard;
