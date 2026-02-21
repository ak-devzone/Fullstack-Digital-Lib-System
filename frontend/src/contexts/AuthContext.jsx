import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../utils/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loginTime, setLoginTime] = useState(() => {
        const stored = localStorage.getItem('loginTime');
        return stored ? new Date(stored) : null;
    });

    const API_URL = 'http://localhost:8000/api';

    // Sign up with email and password
    const signup = async (email, password, userData) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // We don't create the user in backend here. 
        // The user will complete profile later, or we can add a register endpoint.
        // For now, reliance on complete_profile to create the user record is compatible with migration.
        return user;
    };

    // Sign in with email and password
    const login = async (email, password, requiredRole = 'student') => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken();

        try {
            if (requiredRole === 'student') {
                // Verify user exists in UserProfile (Student DB)
                // We use the sync endpoint or profile endpoint. 
                // Let's use the admin/users/:uid endpoint which returns UserProfile data if it exists.
                const response = await fetch(`${API_URL}/admin/users/${user.uid}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        if (data.user.suspended) {
                            await signOut(auth);
                            throw new Error('Your account has been suspended.');
                        }
                        // Valid student
                    }
                } else if (response.status === 404) {
                    // Try syncing first
                    const synced = await syncUserWithBackend(user);
                    if (synced) {
                        // Retry check
                        const retryResponse = await fetch(`${API_URL}/admin/users/${user.uid}/`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (retryResponse.ok) {
                            const data = await retryResponse.json();
                            if (data.success && data.user) {
                                if (data.user.suspended) {
                                    await signOut(auth);
                                    throw new Error('Your account has been suspended.');
                                }
                                return user; // Success
                            }
                        }
                    }

                    // Check if Admin
                    try {
                        const adminCheck = await fetch(`${API_URL}/admin/profile/${user.uid}/`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (adminCheck.ok) {
                            await signOut(auth);
                            throw new Error('Admins must login via the Admin Portal.');
                        }
                    } catch (e) { /* Ignore */ }

                    // If still failing after sync
                    throw new Error('Account setup failed. Please contact support.');
                }
            } else if (requiredRole === 'admin') {
                // Verify user exists in AdminProfile (Admin DB)
                const response = await fetch(`${API_URL}/admin/profile/${user.uid}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    await signOut(auth);
                    throw new Error('Access Denied. Not an authorized administrator.');
                }
            }
        } catch (error) {
            console.error("Login verification failed:", error);
            await signOut(auth); // Ensure we sign out if verification fails
            throw error;
        }

        const now = new Date();
        setLoginTime(now);
        localStorage.setItem('loginTime', now.toISOString());
        return user;
    };

    // Sign in with Google
    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const token = await user.getIdToken();
        const now = new Date();
        setLoginTime(now);
        localStorage.setItem('loginTime', now.toISOString());

        try {
            // Check if user exists in Backend
            const response = await fetch(`${API_URL}/admin/users/${user.uid}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    // Check if suspended
                    if (data.user.suspended) {
                        await signOut(auth);
                        throw new Error('Your account has been suspended. Please contact the administrator for more information.');
                    }

                    // Check if profile completed
                    if (!data.user.department || !data.user.mobile || !data.user.profileCompleted) {
                        return { user: user, needsProfileCompletion: true };
                    }

                    return { user: user, needsProfileCompletion: false };
                }
            } else if (response.status === 404) {
                // User not found, needs profile completion
                return { user: user, needsProfileCompletion: true };
            }
        } catch (error) {
            console.error("Google login verification failed:", error);
            if (error.message.includes('suspended')) throw error;
        }

        // Default fallback
        return { user: user, needsProfileCompletion: true };
    };

    // Sign out
    const logout = async () => {
        if (loginTime && currentUser) {
            try {
                // Calculate session duration in seconds
                const logoutTime = new Date();
                const duration = Math.floor((logoutTime - loginTime) / 1000); // seconds

                // Get user data for session record from Backend
                let userData = {};
                try {
                    const token = await currentUser.getIdToken();
                    const response = await fetch(`${API_URL}/admin/users/${currentUser.uid}/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) userData = data.user;
                    }
                } catch (e) {
                    console.error("Failed to fetch user data for session log", e);
                }

                // Save session data to Firestore (legacy support)
                await addDoc(collection(db, 'sessions'), {
                    userId: currentUser.uid,
                    userDisplayId: userData.userId || 'N/A',
                    userEmail: currentUser.email,
                    userName: userData.name || currentUser.displayName || 'Unknown',
                    department: userData.department || 'N/A',
                    loginTime: loginTime,
                    logoutTime: logoutTime,
                    duration: duration, // in seconds
                    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                    createdAt: serverTimestamp()
                });
            } catch (error) {
                console.error('Error saving session:', error);
            }
        }

        setLoginTime(null);
        localStorage.removeItem('loginTime');
        await signOut(auth);
    };

    // Helper to sync user with backend
    const syncUserWithBackend = async (user) => {
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_URL}/users/sync/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}) // Backend handles token data
            });
            return response.ok;
        } catch (error) {
            console.error("Sync failed:", error);
            return false;
        }
    };

    // Fetch user role from Backend
    const fetchUserRole = async (uid) => {
        try {
            const user = auth.currentUser;
            if (user && user.uid === uid) {
                const token = await user.getIdToken();

                // 1. Try fetching Student Profile
                let response = await fetch(`${API_URL}/admin/users/${uid}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        const role = data.user.role;
                        setUserRole(role);
                        return role;
                    }
                }

                // 2. If not found, Try fetching Admin Profile
                if (response.status === 404) {
                    try {
                        const adminResponse = await fetch(`${API_URL}/admin/profile/${uid}/`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (adminResponse.ok) {
                            const adminData = await adminResponse.json();
                            if (adminData.success) {
                                setUserRole('admin');
                                return 'admin';
                            }
                        }
                    } catch (e) {
                        console.error("Admin check failed", e);
                    }

                    // 3. If neither found, Sync as Student (Default)
                    const synced = await syncUserWithBackend(user);
                    if (synced) {
                        // Retry fetching Student Profile
                        response = await fetch(`${API_URL}/admin/users/${uid}/`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data.success && data.user) {
                                const role = data.user.role;
                                setUserRole(role);
                                return role;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
        return null;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                await fetchUserRole(user.uid);
            } else {
                setUserRole(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        loginTime,
        signup,
        login,
        loginWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
