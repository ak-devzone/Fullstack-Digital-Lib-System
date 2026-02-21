import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, role }) => {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (role && userRole !== role) {
        // Redirect to appropriate dashboard based on actual role
        const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
