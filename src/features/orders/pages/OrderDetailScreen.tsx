
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
// import ChatComponent from '../../../components/ChatComponent'; // Deferred v1.3

const OrderDetailScreen = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { orders, updateOrderStatus } = useStore();
    const order = orders.find(o => o.id === id);

    if (!order) {
        return <div className="p-4">Pedido não encontrado</div>;
    }

    const currentStatus = order.status;

    const steps = [
        { label: 'Aguardando aceitação', active: currentStatus === 'Aguardando aceitação', done: ['Pedido aceito', 'Em rota de entrega', 'Entregue'].includes(currentStatus) },
        { label: 'Pedido aceito', active: currentStatus === 'Pedido aceito', done: ['Em rota de entrega', 'Entregue'].includes(currentStatus) },
        { label: 'Em rota de entrega', active: currentStatus === 'Em rota de entrega', done: currentStatus === 'Entregue' },
        { label: 'Entregue', active: currentStatus === 'Entregue', done: false }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="font-bold text-lg">Pedido #{order.id}</h1>
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-primary">
                    <span className="material-symbols-outlined">print</span>
                </button>
            </header>

            <main className="flex-1 p-4 space-y-5">
                <section className="bg-white dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Status Atual</p>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {order.status}
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                </span>
                            </h2>
                        </div>
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><span className="material-symbols-outlined">inventory_2</span></div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 w-full mb-4"></div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Última atualização:</span>
                        <span className="font-semibold">{order.updated}</span>
                    </div>
                </section>

                <section className="bg-white dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold mb-4">Rastreamento</h3>
                    <div className="relative pl-2 space-y-0">
                        {steps.map((step, i) => (
                            <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                                <div className="flex flex-col items-center">
                                    <div className={`size-6 rounded-full flex items-center justify-center z-10 ${step.done ? 'bg-green-500 text-white' : step.active ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-slate-200 text-slate-400'}`}>
                                        <span className="material-symbols-outlined text-[16px] font-bold">{step.active ? 'inventory_2' : step.done ? 'check' : 'local_shipping'}</span>
                                    </div>
                                    {i !== steps.length - 1 && <div className={`w-0.5 h-full absolute top-6 left-[11px] ${step.done ? 'bg-green-500' : 'bg-slate-200'}`}></div>}
                                </div>
                                <div className="pt-0.5">
                                    <p className={`font-medium leading-none ${step.active ? 'text-primary font-bold' : ''}`}>{step.label}</p>

                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-3">
                    <h3 className="font-bold px-1">Itens do Pedido ({order.items.length})</h3>
                    {order.items.map((item, i) => (
                        <div key={i} className="flex gap-4 bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="size-16 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
                                <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <p className="font-semibold text-sm">{item.name}</p>
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">x {item.quantity}</p>
                                    <p className="text-sm font-bold">R$ {((item.price && item.price > 0) ? item.price : (order.items.length === 1 ? order.total / item.quantity : 0)).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                <section>
                    {/* TODO: ChatComponent deferred (v1.3) */}
                    {/* <ChatComponent orderId={order.id} /> */}
                </section>

                {/* Actions */}
                {order.status === 'Aguardando aceitação' && (
                    <div className="mt-8 px-4 pb-4">
                        <button
                            onClick={async () => {
                                if (confirm('Tem certeza que deseja cancelar este pedido?')) {
                                    const { supabase } = await import('../../../lib/supabaseClient');
                                    const { error } = await supabase.from('orders').update({ status: 'Cancelado' }).eq('id', order.id);

                                    if (error) {
                                        console.error(error);
                                        alert('Erro ao cancelar pedido');
                                    } else {
                                        alert('Pedido cancelado com sucesso');
                                        navigate(-1);
                                    }
                                }
                            }}
                            className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
                        >
                            Cancelar Pedido
                        </button>
                    </div>
                )}
                {order.status === 'Em rota de entrega' && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 z-20">
                        <button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            Confirmar Entrega/Recebimento
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderDetailScreen;
