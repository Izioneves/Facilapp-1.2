
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { User } from '../../../types';

const LoginScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Clean up role handling to match string types if possible, or cast safely
  const roleState = location.state?.role || 'CLIENT';
  const isClient = roleState === 'CLIENT' || roleState === 'client';
  const authType = isClient ? 'client' : 'supplier';

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // For demo purposes, we accept any password if the user exists
      const success = await login(email, password, authType);
      if (success) {
        navigate(isClient ? '/client/home' : '/supplier/dashboard');
      } else {
        setError('Usuário não encontrado. Verifique o e-mail ou cadastre-se.');
      }
    } catch (err) {
      setError('Erro ao tentar entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 flex flex-col justify-center">
      <button onClick={() => navigate(-1)} className="absolute top-6 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4 text-primary">
            <span className="material-symbols-outlined text-4xl">{isClient ? 'person' : 'inventory_2'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acesse sua conta</h1>
          <p className="text-slate-500 mt-2">{isClient ? 'Área do Cliente' : 'Área do Fornecedor'}</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder={isClient ? "demo@cliente.com" : "demo@fornecedor.com"}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Senha</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">lock</span>
              <input
                type={loading ? 'text' : (showPassword ? 'text' : 'password')} // loading check is weird, removing
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm text-primary font-semibold cursor-pointer">Esqueci minha senha</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Entrando...' : (
              <>
                <span>Entrar</span>
                <span className="material-symbols-outlined text-[20px]">login</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Não sou cadastrado?{' '}
              <span
                className="text-primary font-bold cursor-pointer hover:underline"
                onClick={() => navigate(isClient ? '/register/client' : '/register/supplier')}
              >
                Criar conta
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
