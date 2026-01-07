import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { Order } from '../../../types';

const DashboardScreen = () => {
    const navigate = useNavigate();
    const { user, orders, stores } = useStore(); // Access stores to find myStore
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Filter orders for this supplier
    const myOrders = orders.filter(o => o.supplierId === user?.id);
    const myStore = stores.find((s: any) => s.supplierId === user?.id);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !myStore) return;

        try {
            setUploading(true);
            const { data: publicUrl, error: uploadError } = await import('../../../services/api').then(m => m.storeService.uploadImage(file, myStore.id));

            if (uploadError) throw uploadError;
            if (publicUrl) {
                await import('../../../services/api').then(m => m.storeService.update(myStore.id, { image_url: publicUrl }));
                // Force reload or optimistic update could be handled by Context, but for MVP reload is safer or let Realtime handle it. 
                // Ideally context should update. For now, simple alert or refresh logic via window.location.reload() if context doesnt sync fast enough.
                window.location.reload();
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Erro ao enviar imagem");
        } finally {
            setUploading(false);
        }
    };

    const todayDate = new Date().toLocaleDateString();

    const salesToday = myOrders
        .filter(o => new Date(o.date).toLocaleDateString() === todayDate && o.status !== 'Cancelado')
        .reduce((acc, curr) => acc + curr.total, 0);

    const pendingOrders = myOrders.filter(o => o.status === 'Aguardando aceitação' || o.status === 'Pendente').length;

    // Total Balance (Mock: sum of all completed orders for this supplier)
    const totalBalance = myOrders
        .filter(o => o.status === 'Entregue' || o.status === 'Pedido aceito')
        .reduce((acc, curr) => acc + curr.total, 0);

    const recentOrders = [...myOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    if (!myStore) return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-sm text-slate-500">Carregando loja...</p>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3 flex justify-between items-center sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="relative group cursor-pointer" onClick={handleImageClick}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        <div className={`size-10 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 ${myStore?.image_url ? 'bg-white' : 'bg-gradient-to-br from-blue-600 to-purple-600'}`}>
                            {myStore?.image_url ? (
                                <img src={myStore.image_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold text-xs">
                                    {myStore?.name?.substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Edit Overlay */}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-[16px]">{uploading ? 'sync' : 'edit'}</span>
                        </div>

                        <div className="absolute -bottom-1 -right-1 bg-green-500 size-3 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Olá, {user?.name?.split(' ')[0]}!</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{myStore.name}</p>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 relative">
                    <span className="material-symbols-outlined">notifications</span>
                    {pendingOrders > 0 && <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full animate-pulse"></span>}
                </button>
            </header>

            <section className="mt-4 px-4">
                <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar snap-x">
                    <div
                        onClick={() => navigate('/supplier/statement')}
                        className="snap-start min-w-[140px] flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary">payments</span>
                            <p className="text-xs font-bold uppercase text-slate-500">Vendas Hoje</p>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">R$ {salesToday.toFixed(2)}</p>
                        <p className="text-xs font-bold text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">trending_up</span> +0%</p>
                    </div>
                    <div
                        onClick={() => navigate('/supplier/orders')}
                        className="snap-start min-w-[140px] flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-orange-500">shopping_bag</span>
                            <p className="text-xs font-bold uppercase text-slate-500">Novos Pedidos</p>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{pendingOrders}</p>
                        <p className="text-xs text-slate-400">Aguardando envio</p>
                    </div>
                    <div
                        onClick={() => navigate('/supplier/statement')}
                        className="snap-start min-w-[140px] flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-green-600">account_balance_wallet</span>
                            <p className="text-xs font-bold uppercase text-slate-500">Saldo Total</p>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">R$ {totalBalance.toFixed(2)}</p>
                        <p className="text-xs text-primary font-bold hover:underline">Ver extrato</p>
                    </div>
                </div>
            </section>

            <section className="px-4 mt-6">
                <div className="flex justify-between items-end mb-3">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gerenciamento</h2>
                    <button onClick={() => navigate('/supplier/orders')} className="text-primary text-sm font-bold hover:underline">Ver tudo</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <ActionCard
                        title="Adicionar Produto"
                        icon="add"
                        color="bg-primary"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuBsRVLUojOnP8ywnxwLF4McupFj0ef8bSxItRMdZYGUX3sD0t26nKFZYShmDmFu0mguoCQ-eUDckRT9v0_9fDIQfhdcRSeBC5-6l66xEL9j_mVk96AdBEdBsKhL6aL5yaL8QqzY8uQYLkI1BCKDAwfdcqxYGKv1h2Zb3yNMIy7dIVdR5VJSHR8O0aRra93bERFWAY34ifycPAaicRDP8C1exVRakTfBp5LJIq7sarvwjV0rQDHlgOWUPo_7LIjlsUVALe1-jNra3g"
                        onClick={() => navigate('/supplier/add-product')}
                    />
                    <ActionCard
                        title="Meus Produtos"
                        icon="inventory_2"
                        color="bg-white"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuCaoyNgLAFLF599Bnxiw08OEGsm3fpZRwvJyO22XfeGYlecrIWZ1IGGzBgn0A0AyOaR7g-H0CLcGdWHdVBFWoJ615aMY0jy9tCdeybCJpk5cmT07yJh1ABI9nf2I2V2Kx9rGm_24kE7Rod2Tw56-AqDe-PwuT2xeJlmuUa6Pk-0V1liNdEDxINcMp19ScHQYape7WhnuvoXaH-AVblOGkTr89hzEVoP72SKrAaLJoBfGN4SINQB5Hm5QHF6Z8p_wU1O-EPhFXMckA"
                        onClick={() => navigate('/supplier/products')}
                    />
                    <ActionCard
                        title="Pedidos Recebidos"
                        icon="local_shipping"
                        color="bg-white"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuDiCDNg2WpYOY4Yf83556D9THxKYjddS3A0QAPg_FIPLKZxPL2gbP8UO7Dw23la7sFnBinH38LOWgqIzVfa7Z4wSK7fr_QAQvuJqzbq6luVjlQte7NdOaUU3HIB3_4VQUsynszR7vm2T9oDuJAqiMQh_vkhQE9m7zaMRSkoj-ArbseSMXLPWLYqmGLxYOtkTzf1_Ix2gBYVhUbBHdfDkFtl7fSpvRaeJGUWuNYSfikm6xFDRFqqTsCzjQTpe7EjCmAJVxTVutSi3A"
                        onClick={() => navigate('/supplier/orders')}
                    />
                    <ActionCard
                        title="Configurar Loja"
                        icon="store"
                        color="bg-white"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuDiCDNg2WpYOY4Yf83556D9THxKYjddS3A0QAPg_FIPLKZxPL2gbP8UO7Dw23la7sFnBinH38LOWgqIzVfa7Z4wSK7fr_QAQvuJqzbq6luVjlQte7NdOaUU3HIB3_4VQUsynszR7vm2T9oDuJAqiMQh_vkhQE9m7zaMRSkoj-ArbseSMXLPWLYqmGLxYOtkTzf1_Ix2gBYVhUbBHdfDkFtl7fSpvRaeJGUWuNYSfikm6xFDRFqqTsCzjQTpe7EjCmAJVxTVutSi3A"
                        onClick={() => navigate('/supplier/store-settings')}
                    />
                    <ActionCard
                        title="Perfil da Loja"
                        icon="storefront"
                        color="bg-white"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuBTKAOYaHq-cabrHmKxdxSR25Vt92NQAqwauxE3coFMgZwNNy6--lXVb8K27-IBqmevGzBOjuYuQ4qw6PVe5xrbmwVE0OlgC5-2zGj4maUm1JYnHa3pnBvmvMZQ0H51gRXRXCc1w3LeiUrSjN39ejsXCeJwe-11TxUURNbc-J5GaMpbJexy84pgA6mF89rjoeVRez1SScFUrs2nYcSvjiT6w645j5d4QJqlhtaOnufQ8UnTL5FSJJj2JRNW7I9AUcVFycOnFQfdMw"
                        onClick={() => navigate('/supplier/profile')}
                    />
                </div>
            </section>

            <section className="px-4 mt-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Últimos Pedidos</h3>
                <div className="space-y-3">
                    {recentOrders.length === 0 ? (
                        <p className="text-slate-500 italic text-sm">Nenhum pedido recente.</p>
                    ) : (
                        recentOrders.map((o) => (
                            <div key={o.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => navigate(`/supplier/orders/${o.id}`)}>
                                <div className={`p-2.5 rounded-lg shrink-0 ${o.status === 'Aguardando aceitação' || o.status === 'Pendente' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <span className="material-symbols-outlined">{o.status === 'Entregue' ? 'check_circle' : 'package_2'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pedido #{o.id}</h4>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${o.status === 'Aguardando aceitação' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{o.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5 truncate">{o.items.length} itens • {o.customerName || 'Cliente'}</p>
                                    {(o.items.reduce((acc: number, i: any) => acc + (i.quantity * (i.price || 0)), 0) - o.total) > 0.05 ? (
                                        <div className="mt-1">
                                            <span className="text-[10px] text-slate-400 line-through mr-1">R$ {(o.items.reduce((acc: number, i: any) => acc + (i.quantity * (i.price || 0)), 0)).toFixed(2)}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-red-500 font-bold">Desc. -R$ {(o.items.reduce((acc: number, i: any) => acc + (i.quantity * (i.price || 0)), 0) - o.total).toFixed(2)}</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">R$ {o.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">R$ {o.total.toFixed(2)}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

const ActionCard = ({ title, icon, color, image, onClick }: any) => (
    <div onClick={onClick} className="relative h-32 rounded-xl overflow-hidden shadow-md group cursor-pointer active:scale-95 transition-transform">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${image})` }}></div>
        <div className="absolute bottom-0 left-0 p-3 z-20 flex flex-col items-start gap-1">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full mb-1">
                <span className="material-symbols-outlined text-white text-[20px]">{icon}</span>
            </div>
            <p className="text-white text-sm font-bold leading-tight">{title}</p>
        </div>
    </div>
);

export default DashboardScreen;
