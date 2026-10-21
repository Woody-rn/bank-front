import {createContext, useContext, useState, useCallback, type ReactNode} from 'react';
import {useNavigate} from 'react-router-dom';
import {login as apiLogin} from '../api/auth';
import {clearAuth, getStoredUser, type StoredUser} from '../api/client';
import type {LoginRequest} from '../types/api';

interface AuthContextValue {
    user: StoredUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
    const navigate = useNavigate();

    const login = useCallback(
        async (data: LoginRequest) => {
            const res = await apiLogin(data);
            setUser({username: res.username, role: res.role});
            navigate(res.role === 'ADMIN' ? '/admin/cards' : '/user/cards', {replace: true});
        },
        [navigate],
    );

    const logout = useCallback(() => {
        clearAuth();
        setUser(null);
        navigate('/login', {replace: true});
    }, [navigate]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                isAdmin: user?.role === 'ADMIN',
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}