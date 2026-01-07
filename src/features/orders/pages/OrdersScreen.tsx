
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import BottomNav from '../../../components/BottomNav';
import { Order } from '../../../types';

const OrdersScreen = () => {
    const navigate = useNavigate();
    const { orders } = useStore();
    const [tab, setTab] = useState<'active' | 'history'>('active');

    const activeStatuses = ['Aguardando aceitação', 'Pedido aceito', 'Em rota de entrega'];

    const filteredOrders = orders.filter(order => {
        // User wants to see Delivered orders for control.
        // Only "Cancelado" goes to history, or maybe very old Delivered orders?
        // For now, let's keep everything except Cancelled in "Active" (or rename tabs).
        const isHistory = order.status === 'Cancelado';
        return tab === 'history' ? isHistory : !isHistory;
    });

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between p-4 h-16">
                    <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold">Meus Pedidos</h2>
                    <button className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-primary">
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
                <div className="px-4 pb-2">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            className={`flex - 1 py - 2 text - sm font - bold rounded - lg transition - all ${tab === 'active' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'} `}
                            onClick={() => setTab('active')}
                        >
                            Em andamento
                        </button>
                        <button
                            className={`flex - 1 py - 2 text - sm font - bold rounded - lg transition - all ${tab === 'history' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'} `}
                            onClick={() => setTab('history')}
                        >
                            Histórico
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 p-4 space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="bg-slate-100 p-4 rounded-full inline-block mb-3">
                            <span className="material-symbols-outlined text-4xl text-slate-400">receipt_long</span>
                        </div>
                        <h3 className="text-slate-900 font-bold mb-1">Nenhum pedido aqui</h3>
                        <p className="text-slate-500 text-sm">Você não tem pedidos {tab === 'active' ? 'em andamento' : 'no histórico'}.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden active:scale-[0.99] transition-transform">
                            <div className="p-4 pb-2 flex gap-3">
                                <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-slate-400">storefront</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">Fornecedor Exemplo</h3>
                                        <span className={`text - [10px] font - bold px - 2 py - 0.5 rounded uppercase ${order.status === 'Aguardando aceitação' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'Pedido aceito' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'Em rota de entrega' ? 'bg-purple-100 text-purple-700' :
                                                    order.status === 'Entregue' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                            } `}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">Pedido #{order.id.slice(0, 5).toUpperCase()} • {new Date(order.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="px-4 pb-3 pl-[60px]">
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
                                    {order.items.map(i => `${i.quantity}x ${i.name} `).join(', ')}
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">R$ {order.total.toFixed(2)}</p>
                            </div>
                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                                <button
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                    className="flex-1 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                                >
                                    Detalhes
                                </button>
                                {order.status !== 'Entregue' && order.status !== 'Cancelado' && (
                                    <button
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                        className="flex-1 h-9 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">package_2</span>
                                        Acompanhar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrdersScreen;
