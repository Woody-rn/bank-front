import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { Role } from '../types/api';

interface Props {
    role?: Role;
}

export function ProtectedRoute({ role }: Props) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role && user?.role !== role) {
        // залогинен, но не та роль — на свою домашнюю
        return <Navigate to={user?.role === 'ADMIN' ? '/admin/cards' : '/user/cards'} replace />;
    }

    return <Outlet />;
}