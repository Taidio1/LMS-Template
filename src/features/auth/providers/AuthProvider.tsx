import { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (role: UserRole) => boolean;
    clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            if (api.auth.isAuthenticated()) {
                try {
                    const userData = await api.auth.me();
                    setUser({
                        id: userData.id,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role,
                        department: userData.department
                    });
                } catch {
                    // Token invalid/expired - clear it
                    api.auth.removeToken();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.auth.login(email, password);

            const newUser: User = {
                id: response.user.id,
                email: response.user.email,
                name: response.user.name,
                role: response.user.role,
                department: response.user.department
            };

            setUser(newUser);

            // Navigate based on role
            if (response.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await api.auth.logout();
        } finally {
            setUser(null);
            setIsLoading(false);
            navigate('/login');
        }
    }, [navigate]);

    const hasRole = useCallback((role: UserRole) => {
        return user?.role === role;
    }, [user]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                error,
                login,
                logout,
                hasRole,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
