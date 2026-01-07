import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { Order } from '../../../types';

const SupplierOrdersScreen = () => {
    const navigate = useNavigate();
    const { orders, updateOrderStatus, user } = useStore();
    const [activeTab, setActiveTab] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter orders related to this supplier (mock logic: all orders)
    // Confirm filter match
    const myOrders = orders.filter(o => o.supplierId === user?.id);

    const filteredOrders = myOrders.filter(order => {
        const matchTab = activeTab === 'Todos' ||
            (activeTab === 'Pendentes' && (order.status === 'Pendente' || order.status === 'Aguardando aceitação')) ||
            (activeTab === 'Em Preparação' && order.status === 'Pedido aceito') ||
            (activeTab === 'Enviados' && order.status === 'Em rota de entrega') ||
            (activeTab === 'Concluídos' && order.status === 'Entregue');

        const matchSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.includes(searchTerm);

        return matchTab && matchSearch;
    });

    const handleStatusUpdate = (orderId: string, currentStatus: string) => {
        let nextStatus: Order['status'] | null = null;
        if (currentStatus === 'Aguardando aceitação' || currentStatus === 'Pendente') {
            nextStatus = 'Pedido aceito';
        } else if (currentStatus === 'Pedido aceito' || currentStatus === 'Em Preparação') {
            nextStatus = 'Em rota de entrega';
        } else if (currentStatus === 'Em rota de entrega') {
            nextStatus = 'Entregue';
        }

        if (nextStatus) {
            updateOrderStatus(orderId, nextStatus);
        }
    };

    const getActionButtonText = (status: string) => {
        if (status === 'Aguardando aceitação' || status === 'Pendente') return 'Aceitar Pedido';
        if (status === 'Pedido aceito' || status === 'Em Preparação') return 'Enviar Pedido';
        if (status === 'Em rota de entrega') return 'Confirmar Entrega';
        return null;
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">Pedidos Recebidos</h1>
            </header>

            <div className="p-4">
                <div className="relative mb-4">
                    <span className="absolute left-3 top-2.5 material-symbols-outlined text-slate-400">search</span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Buscar pedido por nome ou ID..."
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-2">
                    {['Todos', 'Pendentes', 'Em Preparação', 'Enviados', 'Concluídos'].map((tab, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'bg-white dark:bg-surface-dark text-slate-600 border border-slate-200'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 mt-2">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <p>Nenhum pedido encontrado.</p>
                            <div className="mt-4 p-2 bg-yellow-50 text-xs text-yellow-700 max-w-xs mx-auto text-left">
                                DEBUG: <br />
                                UserID: {user?.id} <br />
                                Context Orders: {orders.length} <br />
                                My Orders: {myOrders.length}
                            </div>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex gap-2 items-center text-xs text-slate-500 font-bold">
                                        <span>#{order.id.slice(0, 5).toUpperCase()}</span>
                                        <span>•</span>
                                        <span>{new Date(order.date).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${order.status === 'Aguardando aceitação' ? 'bg-orange-100 text-orange-600' :
                                        order.status === 'Pedido aceito' ? 'bg-blue-100 text-blue-600' :
                                            order.status === 'Entregue' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {(order.status === 'Aguardando aceitação' || order.status === 'Em rota de entrega') && <span className="size-1.5 bg-current rounded-full animate-pulse"></span>}
                                        {order.status}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{order.customerName}</p>
                                            <p className="text-xs text-slate-500">{order.customerAddress}</p>
                                        </div>
                                        <button className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg hover:bg-slate-200"><span className="material-symbols-outlined text-[20px]">chat</span></button>
                                    </div>
                                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300 mb-3">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="flex justify-between">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span className="font-medium text-slate-900 dark:text-white">R$ {((item.price || 0) * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <p className="text-xs text-slate-400 italic">e mais {order.items.length - 3} itens...</p>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold uppercase text-slate-400">Total</span>
                                            {(order.items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0) - order.total) > 0.05 && (
                                                <span className="text-xs text-red-500 font-bold">
                                                    Desc. -R$ {(order.items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0) - order.total).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {(order.items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0) - order.total) > 0.05 && (
                                                <span className="block text-xs text-slate-400 line-through">
                                                    R$ {order.items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0).toFixed(2)}
                                                </span>
                                            )}
                                            <span className="text-lg font-bold text-primary">R$ {order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 flex gap-2">
                                    <button onClick={() => navigate(`/supplier/orders/${order.id}`)} className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Detalhes</button>
                                    {getActionButtonText(order.status) && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, order.status)}
                                            className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-colors"
                                        >
                                            {getActionButtonText(order.status)}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierOrdersScreen;
