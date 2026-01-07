import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../../types';
import { authService } from '../../../services/api';
import { supabase } from '../../../lib/supabaseClient';

interface AuthContextType {
    user: User | null;
    isAuthLoading: boolean;
    login: (email: string, password: string, role: 'client' | 'supplier') => Promise<boolean>;
    register: (user: User) => Promise<boolean>;
    logout: () => void;
    setUser: (user: User | null) => void;
    syncUserFromDB: (sessionUser: any) => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const syncUserFromDB = async (sessionUser: any) => {
        try {
            const { data: profile } = await authService.getProfile(sessionUser.id);
            const meta = sessionUser.user_metadata;

            const source = profile || {
                name: meta.name || meta.full_name || meta.companyName,
                role: meta.role,
                phone: meta.phone,
                cpf: meta.cpf,
                cnpj: meta.cnpj,
                address: meta.address,
                categories: meta.categories
            };

            const restoredUser: User = {
                id: sessionUser.id,
                email: sessionUser.email!,
                type: (source.role || 'client') as any,
                name: source.name || 'User',
                password: '',
                cpf: source.cpf || '',
                phone: source.phone || '',
                address: source.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
                categories: source.categories || [],
                cnpj: source.cnpj,
                companyName: source.name,
                responsibleName: source.responsibleName
            };

            setUser(restoredUser);
        } catch (err) {
            console.error("Sync User Error", err);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            console.log("[AUTH] Init Auth...");
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                console.log("[AUTH] Session found for:", session.user.email);
                await syncUserFromDB(session.user);
            } else {
                console.log("[AUTH] No session found.");
            }
            setIsAuthLoading(false);
        };
        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                setUser(null);
            } else {
                syncUserFromDB(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string, type: 'client' | 'supplier'): Promise<boolean> => {
        try {
            setError(null);
            const { data, error } = await authService.login(email, password, type);

            if (error) {
                setError(error.message || 'Login falhou');
                return false;
            }

            const { user: sbUser } = data;
            if (!sbUser) return false;

            const role = sbUser.user_metadata?.role;
            if (role && role !== 'demo' && role.toLowerCase() !== type.toLowerCase()) {
                setError(`Esta conta não é de ${type === 'client' ? 'Cliente' : 'Fornecedor'}`);
                await authService.logout();
                return false;
            }

            await syncUserFromDB(sbUser);
            return true;
        } catch (err: any) {
            setError(err.message || 'Login falhou');
            return false;
        }
    };

    const register = async (newUser: User): Promise<boolean> => {
        try {
            setError(null);
            const metadata = {
                role: newUser.type,
                name: newUser.type === 'client' ? newUser.name : newUser.companyName,
                cpf: newUser.cpf,
                cnpj: newUser.cnpj,
                responsibleName: newUser.responsibleName,
                phone: newUser.phone,
                address: newUser.address
            };

            const { data, error } = await authService.register(newUser.email, newUser.password || '', metadata);

            if (error) {
                setError(error.message || 'Erro ao registrar');
                return false;
            }

            if (data.session) {
                // Auto-login successful
                return true;
            } else if (data.user && !data.session) {
                // Email confirmation case? 
                // If Supabase allows sign-in without confirmation or if auto-confirm is on:
                // Try precise login to force session if not returned
                if (newUser.password) {
                    return await login(newUser.email, newUser.password, newUser.type);
                }
                setError('Cadastro realizado! Verifique seu e-mail.');
                return false;
            }

            return true;
        } catch (err: any) {
            setError(err.message || 'Registro falhou');
            return false;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthLoading, login, register, logout, setUser, syncUserFromDB, error }}>
            {children}
        </AuthContext.Provider>
    );
};
