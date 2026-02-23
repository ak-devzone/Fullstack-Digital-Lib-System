export const DEPARTMENTS = [
    { code: 'CSE', name: 'Computer Science Engineering' },
    { code: 'ECE', name: 'Electronics & Communication Engineering' },
    { code: 'MECH', name: 'Mechanical Engineering' },
    { code: 'CIVIL', name: 'Civil Engineering' },
    { code: 'OTHER', name: 'Other' }
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6];

export const ROLES = {
    STUDENT: 'student',
    ADMIN: 'admin'
};

export const USER_ROLES = [
    { value: 'student', label: 'Student', icon: '🎓' },
    { value: 'other', label: 'Other', icon: '👤' }
];

export const BADGES = [
    {
        name: 'Beginner',
        icon: '📘',
        requirement: 1,
        description: 'Complete 1 book'
    },
    {
        name: 'Advanced',
        icon: '📗',
        requirement: 5,
        description: 'Complete 5 books'
    },
    {
        name: 'Master Reader',
        icon: '📙',
        requirement: 10,
        description: 'Complete 10 books'
    }
];

export const API_URL = import.meta.env.VITE_API_URL || 'https://djangobackendapi.up.railway.app/api';

// Admin registration secret key
export const ADMIN_SECRET_KEY = 'LIBRARY_ADMIN_2008';
