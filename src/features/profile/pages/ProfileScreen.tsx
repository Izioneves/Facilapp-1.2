import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import SupplierStoreSettingsScreen from '../../supplier/pages/SupplierStoreSettingsScreen';

const ProfileScreen = () => {
    const navigate = useNavigate();
    const { user, setUser, logout } = useStore();
    const [currentView, setCurrentView] = useState<'main' | 'settings'>('main');
    const [settingsSection, setSettingsSection] = useState<'store' | 'delivery' | 'finance'>('store');

    const handleLogout = () => {
        logout();
        navigate('/welcome');
    };

    if (currentView === 'settings') {
        return (
            <SupplierStoreSettingsScreen
                onBack={() => setCurrentView('main')}
                initialSection={settingsSection}
            />
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 shadow-sm sticky top-0 z-10 text-center">
                <h2 className="text-lg font-bold">Meu Perfil</h2>
            </header>

            <section className="bg-white dark:bg-surface-dark pt-8 pb-6 px-4 mb-4 rounded-b-2xl shadow-sm flex flex-col items-center">
                <div className="relative mb-4 size-28">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full border-4 border-slate-50 dark:border-slate-700 shadow-md object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-full border-4 border-slate-50 dark:border-slate-700 shadow-md bg-slate-200 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-400 text-[64px]">person</span>
                        </div>
                    )}
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {user?.name || 'Usuário Sem Nome'}
                </h1>
                <p className="text-sm text-slate-500">{user?.email}</p>
            </section>





            <div className="px-4 space-y-6">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 ml-1">Minha Conta</h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        {user?.type === 'client' ? (
                            <>
                                <MenuItem icon="person" label="Meus Dados" onClick={() => navigate('/profile/edit')} />
                                <MenuItem icon="location_on" label="Endereços" onClick={() => navigate('/addresses')} />
                                <MenuItem icon="credit_card" label="Formas de Pagamento" onClick={() => navigate('/payment-methods')} last />
                            </>
                        ) : (
                            <>
                                <MenuItem
                                    icon="store"
                                    label="Dados da Loja"
                                    onClick={() => {
                                        setSettingsSection('store');
                                        setCurrentView('settings');
                                    }}
                                />
                                <MenuItem
                                    icon="settings"
                                    label="Configuração de Entrega"
                                    onClick={() => {
                                        setSettingsSection('delivery');
                                        setCurrentView('settings');
                                    }}
                                />
                                <MenuItem icon="account_balance_wallet" label="Financeiro" onClick={() => navigate('/supplier/statement')} last />
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 ml-1">Configurações</h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <MenuItem icon="notifications" label="Notificações" badge="ON" onClick={() => navigate('/settings')} />
                        <MenuItem icon="lock" label="Privacidade e Segurança" onClick={() => navigate('/settings')} last />
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 ml-1">Suporte</h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <MenuItem icon="help" label="Ajuda e FAQ" onClick={() => alert("FAQs disponíveis em breve!")} />
                        <MenuItem icon="headset_mic" label="Fale Conosco (WhatsApp)" onClick={() => window.open('https://wa.me/554198070056', '_blank')} last />
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Sair do App
                </button>

                <div className="mt-8 text-center pb-8">
                    <p className="text-xs text-slate-400">Versão 1.2</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium opacity-60">Desenvolvido por Aloizio Neves</p>
                </div>
            </div>
        </div >
    );
};

const MenuItem = ({ icon, label, badge, last, onClick }: { icon: string, label: string, badge?: string, last?: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!last ? 'border-b border-slate-50 dark:border-slate-700' : ''}`}>
        <div className="bg-primary/10 text-primary p-2 rounded-lg"><span className="material-symbols-outlined text-[20px]">{icon}</span></div>
        <span className="flex-1 text-left text-sm font-medium text-slate-900 dark:text-white">{label}</span>
        {badge && <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">{badge}</span>}
        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
    </button>
);

export default ProfileScreen;
