import React from 'react';
import { useStore } from '../../../contexts/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';

const OrderSuccessScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = location.state || { orderId: 'UNKNOWN' };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="size-28 bg-white dark:bg-surface-dark rounded-full shadow-sm flex items-center justify-center relative z-10">
          <div className="size-24 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40">
            <span className="material-symbols-outlined text-white text-5xl">check</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pedido Confirmado!</h1>
      <p className="text-slate-500 max-w-xs mb-8">Seu pedido foi recebido com sucesso e já foi enviado para o fornecedor. Enviamos um e-mail com os detalhes.</p>

      <div className="w-full bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-auto">
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 uppercase">Número do Pedido</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">#{orderId.slice(0, 5).toUpperCase()}</p>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-full text-primary"><span className="material-symbols-outlined">content_copy</span></button>
          </div>
          <div className="flex items-start gap-4 text-left">
            <div className="bg-primary/10 p-2 rounded-lg text-primary"><span className="material-symbols-outlined">local_shipping</span></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Previsão de Entrega</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Hoje</p>
              <p className="text-xs text-slate-400">Entrega Padrão</p>
            </div>
          </div>
        </div>
        <div className="h-1.5 w-full bg-primary/10 bg-[repeating-linear-gradient(45deg,#34a4f4,#34a4f4_10px,transparent_10px,transparent_20px)] opacity-30"></div>
      </div>

      <div className="w-full space-y-3 mt-6">
        <button
          onClick={() => navigate('/client/orders')}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-14 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <span>Acompanhar Pedido</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <button
          onClick={() => navigate('/client/home')}
          className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold h-12 rounded-xl transition-colors"
        >
          Voltar para o Início
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessScreen;
