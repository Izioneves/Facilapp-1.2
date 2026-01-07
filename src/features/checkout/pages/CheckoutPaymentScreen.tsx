import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useStore } from '../../../contexts/StoreContext';

const CheckoutPaymentScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isProfileMode = location.pathname === '/payment-methods';

    const { cart, checkoutState, setPaymentMethod, paymentMethods, addPaymentMethod, removePaymentMethod } = useStore();
    const [selectedMethod, setSelectedMethod] = useState<string>(checkoutState.paymentMethod || '');

    React.useEffect(() => {
        if (selectedMethod && !isProfileMode) {
            setPaymentMethod(selectedMethod);
        }
    }, [selectedMethod, isProfileMode]);

    const total = isProfileMode ? 0 : cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [showCardForm, setShowCardForm] = useState(false);
    const [newCard, setNewCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [shake, setShake] = useState(false);

    const handleReviewOrder = () => {
        if (!selectedMethod) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
        navigate('/checkout/summary');
    };

    const handleSaveCard = () => {
        if (!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv) {
            alert("Preencha todos os campos do cartão.");
            return;
        }

        const last4 = newCard.number.slice(-4);
        const newId = `card_${Date.now()}`;
        const newMethod = {
            id: newId,
            type: 'credit_card' as const,
            label: `Cartão final ${last4}`,
            icon: 'credit_card',
            last4
        };

        addPaymentMethod(newMethod);
        setSelectedMethod(newId);

        if (!isProfileMode) {
            setPaymentMethod(newId);
        }

        setShowCardForm(false);
        setNewCard({ number: '', name: '', expiry: '', cvv: '' });
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">{isProfileMode ? 'Formas de Pagamento' : 'Pagamento'}</h1>
            </header>

            {!isProfileMode && (
                <div className="bg-white dark:bg-surface-dark pb-6 pt-2 mb-4 shadow-sm">
                    <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                        <div className="flex flex-col items-center gap-1">
                            <div className="size-6 rounded-full bg-green-500 text-white flex items-center justify-center"><span className="material-symbols-outlined text-sm font-bold">check</span></div>
                            <span className="text-[10px] font-bold text-green-600">Carrinho</span>
                        </div>
                        <div className="h-[2px] w-12 bg-green-500 rounded-full"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="size-6 rounded-full bg-green-500 text-white flex items-center justify-center"><span className="material-symbols-outlined text-sm font-bold">check</span></div>
                            <span className="text-[10px] font-bold text-green-600">Entrega</span>
                        </div>
                        <div className="h-[2px] w-12 bg-primary rounded-full"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="size-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs ring-4 ring-primary/20">3</div>
                            <span className="text-[10px] font-bold text-primary">Pagar</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 px-4 space-y-4 overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isProfileMode ? 'Seus cartões salvos' : 'Como você quer pagar?'}
                </h2>

                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                        20%, 40%, 60%, 80% { transform: translateX(5px); }
                    }
                    .shake-animation {
                        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                        border-color: #ef4444 !important; /* Red border */
                        background-color: #fef2f2 !important; /* Red bg */
                    }
                `}</style>
                <div className={`space-y-3 animate-slide-up transition-colors duration-300 rounded-xl p-2 ${shake ? 'shake-animation' : ''}`}>
                    {paymentMethods.map((method) => (
                        <label key={method.id} className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer relative transition-all active:scale-[0.99] ${!isProfileMode && selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-transparent bg-white dark:bg-surface-dark shadow-sm hover:border-slate-200'}`}>
                            {!isProfileMode && (
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={selectedMethod === method.id}
                                    onChange={() => setSelectedMethod(method.id)}
                                    className="mt-1 accent-primary"
                                />
                            )}
                            <div className="flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-3 font-bold text-slate-900 dark:text-white">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">{method.icon}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={method.label.includes('OFF') ? 'text-green-600' : ''}>{method.label}</span>
                                        {method.type === 'credit_card' && !isProfileMode && <span className="text-xs text-slate-500 font-normal">Crédito à vista</span>}

                                    </div>
                                </div>
                                {!isProfileMode && selectedMethod === method.id && <span className="text-primary text-xs font-bold uppercase">Selecionado</span>}
                                {isProfileMode && method.id.startsWith('card_') && (
                                    <button onClick={(e) => { e.preventDefault(); removePaymentMethod(method.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                )}
                            </div>
                        </label>
                    ))}
                </div>

                {!showCardForm ? (
                    <button
                        onClick={() => setShowCardForm(true)}
                        className="w-full py-4 border border-dashed border-primary/40 rounded-xl flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary/5 transition-colors"
                    >
                        <span className="material-symbols-outlined">add_card</span>
                        Adicionar novo cartão
                    </button>
                ) : (
                    <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-fade-in space-y-3">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Novo Cartão</h3>
                        <input
                            type="text"
                            placeholder="Número do Cartão"
                            className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 outline-none focus:border-primary"
                            value={newCard.number}
                            onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                            maxLength={16}
                        />
                        <input
                            type="text"
                            placeholder="Nome no Cartão"
                            className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 outline-none focus:border-primary"
                            value={newCard.name}
                            onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                        />
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="MM/AA"
                                className="flex-1 p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 outline-none focus:border-primary"
                                value={newCard.expiry}
                                onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                                maxLength={5}
                            />
                            <input
                                type="text"
                                placeholder="CVV"
                                className="w-24 p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 outline-none focus:border-primary"
                                value={newCard.cvv}
                                onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                                maxLength={4}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowCardForm(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancelar</button>
                            <button onClick={handleSaveCard} className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-lg shadow-primary/20">Salvar Cartão</button>
                        </div>
                    </div>
                )}

                {!isProfileMode && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl flex gap-3 items-start border border-yellow-100 dark:border-yellow-900/50">
                        <span className="material-symbols-outlined text-yellow-600">security</span>
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            Pagamento processado com segurança. Seus dados estão protegidos.
                        </p>
                    </div>
                )}
            </div>

            {!isProfileMode && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 max-w-md mx-auto z-20">
                    <div className="flex justify-between mb-4 px-1">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Total a pagar</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">R$ {total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleReviewOrder}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                        <span>Revisar Pedido</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default CheckoutPaymentScreen;
