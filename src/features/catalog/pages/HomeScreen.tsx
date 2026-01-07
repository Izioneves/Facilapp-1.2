
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { useAuth } from '../../../features/auth/contexts/AuthContext';
import BottomNav from '../../../components/BottomNav';
import { Category } from '../../../types';
import { calculateDistance, formatDistance } from '../../../utils/geo';

const HomeScreen = () => {
    const navigate = useNavigate();
    const { stores, user, cart, error, orders } = useStore();
    const [searchTerm, setSearchTerm] = useState('');

    const formattedAddress = user?.address
        ? `${user.address.street}, ${user.address.number} `
        : 'Selecione um endereço';

    // Sort Stores by proximity
    const sortedStores = useMemo(() => {
        if (!user?.location || !stores.length) return stores;

        return [...stores].map(store => {
            if (!store.latitude || !store.longitude) return { ...store, distance: 9999 };
            const dist = calculateDistance(
                user.location!.lat, user.location!.lng,
                store.latitude, store.longitude
            );
            return { ...store, distance: dist };
        }).sort((a, b) => a.distance - b.distance);
    }, [stores, user]);

    // Filter by search
    const filteredStores = useMemo(() => {
        if (!searchTerm) return sortedStores;
        return sortedStores.filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [sortedStores, searchTerm]);

    return (
        <div className="pb-24">
            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark sticky top-0 z-40 shadow-sm">
                <div className="flex flex-col">
                    <div className="flex items-center text-slate-500 text-xs gap-1 cursor-pointer">
                        <span>Entregar em:</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{formattedAddress}</span>
                        <span className="material-symbols-outlined text-[14px]">expand_more</span>
                    </div>
                    <h1 className="text-xl font-bold text-primary">FácilAPP</h1>
                </div>
                <div
                    className={`relative p - 2 rounded - full hover: bg - slate - 100 cursor - pointer`}
                    onClick={() => navigate('/client/cart')}
                >
                    <span className="material-symbols-outlined text-slate-600 dark:text-white">shopping_cart</span>
                    {cart.length > 0 && (
                        <span className="absolute top-1 right-1 size-3.5 bg-accent-red text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                            {cart.length}
                        </span>
                    )}
                </div>
            </header>

            {/* Search Bar */}
            <div className="px-4 py-2 sticky top-[72px] z-30 bg-background-light dark:bg-background-dark">
                <div className="flex items-center bg-white dark:bg-surface-dark rounded-xl px-4 py-3 shadow-sm text-slate-400">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Buscar lojas..."
                        className="ml-2 text-sm flex-1 bg-transparent outline-none text-slate-900 dark:text-white"
                        readOnly
                        onFocus={() => navigate('/search')}
                        onClick={() => navigate('/search')}
                    />
                </div>
            </div>

            {/* Active Order Widget */}
            {orders && orders.filter((o: any) => !['Entregue', 'Cancelado'].includes(o.status)).length > 0 && (
                <div className="px-4 mt-4">
                    <div className="bg-blue-600 text-white rounded-xl p-4 shadow-lg shadow-blue-600/20 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                        onClick={() => navigate(`/orders/${orders.filter((o: any) => !['Entregue', 'Cancelado'].includes(o.status))[0].id}`)}>

                        {/* Background Decoration */}
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <div>
                                <h3 className="font-bold text-lg">Pedido em Andamento</h3>
                                <p className="text-blue-100 text-sm">
                                    {orders.filter((o: any) => !['Entregue', 'Cancelado'].includes(o.status))[0].items[0]?.name}
                                    {orders.filter((o: any) => !['Entregue', 'Cancelado'].includes(o.status))[0].items.length > 1 && ` + ${orders.filter((o: any) => !['Entregue', 'Cancelado'].includes(o.status))[0].items.length - 1} itens`}
                                </p>
                            </div>
                            <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold uppercase backdrop-blur-sm">
                                {orders.filter((o: any) => !['Entregue', 'Cancelado'].includes(o.status))[0].status}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-medium border-t border-white/10 pt-2 mt-2">
                            <span className="material-symbols-outlined text-[18px]">package_2</span>
                            Acompanhar Entrega
                            <span className="material-symbols-outlined ml-auto text-[18px]">arrow_forward</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Store List */}
            <div className="px-4 mt-4 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Lojas Próximas</h2>
                {filteredStores.length > 0 ? (
                    filteredStores.map((store: any) => (
                        <div
                            key={store.id}
                            onClick={() => navigate(`/store/${store.id}`)}
                            className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all"
                        >
                            <div className={`size-16 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 ${store.image || store.image_url ? 'bg-slate-100' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                                {store.image || store.image_url ? (
                                    <img src={store.image || store.image_url} alt={store.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-xl uppercase">
                                        {store.name.substring(0, 2)}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">{store.name}</h3>
                                <p className="text-xs text-slate-500 line-clamp-1">{store.description || "Produtos de limpeza e mais"}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {store.distance !== undefined && store.distance < 9000 && (
                                        <span className="text-[11px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                            {formatDistance(store.distance)}
                                        </span>
                                    )}
                                    <span className="text-[11px] text-slate-400">• Entrega Rabet</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <span className="material-symbols-outlined text-4xl text-slate-300">location_off</span>
                        <p className="text-slate-500 mt-2">Nenhuma loja encontrada na sua região.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeScreen;
