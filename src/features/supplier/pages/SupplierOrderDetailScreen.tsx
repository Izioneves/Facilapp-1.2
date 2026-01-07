import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { Order } from '../../../types';
import ChatComponent from '../../../components/ChatComponent';

const SupplierOrderDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders, updateOrderStatus } = useStore();
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="flex flax-col h-screen items-center justify-center p-6 text-center">
        <p className="text-slate-500">Pedido não encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Voltar</button>
      </div>
    );
  }

  const handleStatusUpdate = (currentStatus: string) => {
    let nextStatus: Order['status'] | null = null;
    if (currentStatus === 'Aguardando aceitação' || currentStatus === 'Pendente') {
      nextStatus = 'Pedido aceito';
    } else if (currentStatus === 'Pedido aceito') {
      nextStatus = 'Em rota de entrega';
    } else if (currentStatus === 'Em rota de entrega') {
      nextStatus = 'Entregue';
    }

    if (nextStatus) {
      updateOrderStatus(order.id, nextStatus);
    }
  };

  const getActionButtonText = (status: string) => {
    if (status === 'Aguardando aceitação' || status === 'Pendente') return 'Aceitar Pedido';
    if (status === 'Pedido aceito' || status === 'Em Preparação') return 'Enviar Pedido';
    if (status === 'Em rota de entrega') return 'Confirmar Entrega';
    return null;
  };

  const statusColor = (status: string) => {
    if (status === 'Pending' || status === 'Aguardando aceitação' || status === 'Pendente') return 'bg-orange-100 text-orange-600';
    if (status === 'Pedido aceito' || status === 'Em Preparação') return 'bg-blue-100 text-blue-600';
    if (status === 'Em rota de entrega') return 'bg-purple-100 text-purple-600';
    if (status === 'Entregue') return 'bg-green-100 text-green-600';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <header className="bg-white dark:bg-surface-dark p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Pedido #{id}</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 font-bold uppercase mb-2">Status do Pedido</p>
          <div className="flex justify-between items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${statusColor(order.status)}`}>
              {['Aguardando aceitação', 'Em rota de entrega', 'Pendente'].includes(order.status) && (
                <span className="size-2 bg-current rounded-full animate-pulse"></span>
              )}
              {order.status}
            </span>
            <span className="text-xs text-slate-400">{new Date(order.date).toLocaleString()}</span>
          </div>
          {getActionButtonText(order.status) && (
            <div className="space-y-3 mt-4">
              <button
                onClick={() => handleStatusUpdate(order.status)}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
              >
                {getActionButtonText(order.status)}
              </button>

              {order.status === 'Aguardando aceitação' && (
                <button
                  onClick={async () => {
                    if (confirm('Tem certeza que deseja recusar este pedido?')) {
                      const { supabase } = await import('../../../lib/supabaseClient');
                      const { error } = await supabase.from('orders').update({ status: 'Cancelado' }).eq('id', order.id);
                      if (error) {
                        alert('Erro ao recusar pedido');
                      } else {
                        // Refresh or Navigate? 
                        // Usually context updates via subscription or we force refresh.
                        // Navigate back is safest.
                        navigate(-1);
                      }
                    }
                  }}
                  className="w-full bg-white dark:bg-surface-dark border border-red-200 text-red-600 font-bold py-3 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Recusar Pedido
                </button>
              )}
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
            <span className="material-symbols-outlined text-slate-400">person</span>
            <h3 className="font-bold text-slate-900 dark:text-white">Dados do Cliente</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase">Nome</p>
              <p className="font-bold text-slate-900 dark:text-white">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Endereço de Entrega</p>
              <div className="font-medium text-slate-900 dark:text-white">
                {typeof order.address === 'object' && order.address !== null ? (
                  <>
                    <p className="font-bold">{order.address.street}, {order.address.number}</p>
                    <p className="text-sm">{order.address.neighborhood} - {order.address.city}/{order.address.state}</p>
                    <p className="text-xs text-slate-500 mt-0.5">CEP: {order.address.zipCode}</p>
                    {order.address.complement && <p className="text-sm text-slate-600 italic">Comp: {order.address.complement}</p>}
                  </>
                ) : (
                  <p>{order.customerAddress || order.address || 'Endereço não informado'}</p>
                )}
              </div>
              {order.distance && (
                <p className="text-xs text-primary font-bold mt-1">Distância da Loja: {order.distance.toFixed(1)} km</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Pagamento</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">payments</span>
                <p className="font-bold text-slate-900 dark:text-white capitalize">
                  {order.paymentMethod === 'pix' ? 'Pix' :
                    order.paymentMethod === 'cash' ? 'Dinheiro' :
                      order.paymentMethod === 'card_delivery_debit' ? 'Débito (Entrega)' :
                        order.paymentMethod === 'card_delivery_credit' ? 'Crédito (Entrega)' :
                          order.paymentMethod === 'card' ? 'Cartão' :
                            order.paymentMethod || 'Não informado'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-[18px]">chat</span> Chat
              </button>
              <button className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-[18px]">call</span> Ligar
              </button>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">shopping_bag</span>
              <h3 className="font-bold text-slate-900 dark:text-white">Itens do Pedido</h3>
            </div>
            <span className="bg-white dark:bg-slate-700 px-2 py-1 rounded text-xs font-bold shadow-sm">
              {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="size-16 bg-slate-100 rounded-lg shrink-0 p-1 border border-slate-200 dark:border-slate-600">
                  <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-1">{item.name}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-2">
                    <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                      Un: R$ {(item.price || 0).toFixed(2)}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                      Qtd: {item.quantity}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <p className="text-base font-bold text-slate-900 dark:text-white">R$ {(item.quantity * (item.price || 0)).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-500">Subtotal</span>
              <span className="font-medium">R$ {order.items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0).toFixed(2)}</span>
            </div>

            {/* Show Discount if Total is less than Subtotal (e.g. Pix Discount) */}
            {(order.items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0) - order.total) > 0.05 && (
              <div className="flex justify-between items-center mb-1 text-red-600">
                <span className="text-sm font-bold">Descontos (Pix/Cupom)</span>
                <span className="font-bold">- R$ {(order.items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0) - order.total).toFixed(2)}</span>
              </div>
            )}
            {(order.items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0) - order.total) > 0.05 && (
              <div className="flex justify-between items-center mb-1 text-red-600">
                <span className="text-sm font-bold">Descontos (Pix/Cupom)</span>
                <span className="font-bold">- R$ {(order.items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0) - order.total).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-600">
              <span className="font-bold text-lg text-slate-900 dark:text-white">Total Geral</span>
              <span className="text-2xl font-bold text-primary">R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <ChatComponent orderId={order.id} />
        </div>
      </div>
    </div>
  );
};

export default SupplierOrderDetailScreen;
