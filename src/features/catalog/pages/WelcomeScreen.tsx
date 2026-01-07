
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';

const WelcomeScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark p-6">
            <div className="flex-1 flex flex-col justify-center items-center gap-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <span className="material-symbols-outlined text-primary text-4xl">local_mall</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">FácilAPP</h1>
                </div>

                <div className="w-full relative aspect-[2/1] rounded-2xl overflow-hidden shadow-lg mb-4 group">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB0-UiFURuG0Pq2JH2fqtS2gNOQmHCUZ9LNxSE2xTfuyrxaVAph0KNMvdszN_Hn4hBEydHn3z6spOJlZPaYmkXRGsxrH28Fk1L_G6sPhIpdb1NEy8Jlut6EGucd7xveaAVrgHb0OPr50EM5qMdn_1buKsl99Q4Axd4i_wYKgY3oImDWItmcRqgMArZJ-Yo7qDazVmlIPV7LP07-0cgTHSFnCUefQQ7qbRBJZOl7dMtBPzWu7bgMICJ4eABpKBfOZkXf1hqGbPM09Q")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block">Novo</span>
                        <h2 className="text-white text-xl font-bold leading-tight">O marketplace de limpeza nº1 do Brasil</h2>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <h3 className="text-center text-slate-900 dark:text-white text-xl font-bold">Bem-vindo!</h3>
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">Como você deseja acessar?</p>

                    <button
                        onClick={() => navigate('/login', { state: { role: 'CLIENT' } })}
                        className="w-full bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-transparent hover:border-primary/30 transition-all flex items-center gap-4 group"
                    >
                        <div className="bg-primary/10 p-3 rounded-lg text-primary group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">shopping_cart</span>
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-bold text-slate-900 dark:text-white">Sou Cliente</p>
                            <p className="text-xs text-slate-500">Quero comprar produtos</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </button>

                    <button
                        onClick={() => navigate('/login', { state: { role: 'SUPPLIER' } })}
                        className="w-full bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-transparent hover:border-primary/30 transition-all flex items-center gap-4 group"
                    >
                        <div className="bg-purple-500/10 p-3 rounded-lg text-purple-600 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">storefront</span>
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-bold text-slate-900 dark:text-white">Sou Fornecedor</p>
                            <p className="text-xs text-slate-500">Quero vender meus produtos</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </button>
                    <a
                        href="/facilapp.apk"
                        download
                        className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center gap-4 group mt-4 text-decoration-none"
                    >
                        <div className="bg-green-500/10 p-3 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">android</span>
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-bold text-slate-900 dark:text-white">Baixar App Android</p>
                            <p className="text-xs text-slate-500">Versão de Teste (APK)</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">download</span>
                    </a>
                </div>
            </div>

            {/* Footer link removed to enforce flow through Login */}
        </div>
    );
};

export default WelcomeScreen;
