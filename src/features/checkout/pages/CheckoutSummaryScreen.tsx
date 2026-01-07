import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useStore } from '../../../contexts/StoreContext';

const CheckoutSummaryScreen = () => {
    const navigate = useNavigate();
    const { cart, clearCart, addOrder, user, checkoutState, createOrder, isLoading, deliveryFee } = useStore();
    const address = checkoutState.deliveryAddress || user?.address;
    const paymentMethodId = checkoutState.paymentMethod;

    // ... (lines 10-31 unchanged) ...

    const handleConfirm = async () => {
        if (!user) {
            alert('Você precisa estar logado para finalizar o pedido.');
            return;
        }

        const success = await createOrder();
        if (success) {
            // Navigation state ID is optional or we can pass a 'latest' flag
            navigate('/order-success', { state: { orderId: 'multi' } });
        } else {
            alert('Houve um erro ao processar seu pedido. Tente novamente.');
        }
    };

    // Mock lookup for payment method label (safe since only display)
    const paymentLabel = paymentMethodId?.startsWith('card_') || paymentMethodId === 'credit1' ? 'Mastercard •••• 8842' :
        paymentMethodId === 'pix' ? 'Pix' :
            paymentMethodId === 'cash' ? 'Dinheiro' : 'Método de Pagamento';

    // FIX: Calculate values BEFORE using them (prevents ReferenceError)
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = deliveryFee || 0;

    const { stores } = useStore();
    const currentStoreId = cart[0]?.storeId;
    const currentStore = stores.find(s => s.id === currentStoreId);

    // FIX: Only apply discount if configured (> 0)
    const storePixDiscount = currentStore?.pixDiscount || 0;
    const pixDiscountPercent = storePixDiscount > 0 ? storePixDiscount / 100 : 0;

    // Recalculate based on real config
    const finalDiscount = paymentMethodId === 'pix' ? subtotal * pixDiscountPercent : 0;
    const total = subtotal + shipping - finalDiscount;



    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">Resumo do Pedido</h1>
            </header>

            <div className="flex-1 px-4 py-6 space-y-6">

                {/* Address */}
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Endereço de Entrega</h3>
                    <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4 items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                                <span className="font-bold">Entrega em:</span>
                            </div>
                            {address ? (
                                <>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{address.street}, {address.number}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{address.neighborhood} - {address.city}/{address.state}</p>
                                    <p className="text-xs text-slate-400">CEP: {address.zipCode}</p>
                                </>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Nenhum endereço selecionado</p>
                            )}
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mt-2 inline-block">Previsão: 2 dias úteis</span>
                        </div>
                        <div className="size-20 bg-slate-200 rounded-lg overflow-hidden relative">
                            <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-3xl">map</span>
                            </div>
                            <button onClick={() => navigate('/addresses')} className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">Alterar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Itens do Pedido</h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-sm">storefront</span>
                            <span className="text-xs text-slate-500 font-medium">Vendido e entregue por <b>{cart[0]?.supplierName || currentStore?.name || "Loja Parceira"}</b></span>
                        </div>
                        {cart.map((item) => (
                            <div key={item.id} className="p-4 flex gap-4 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                <div className="size-16 bg-slate-50 rounded-lg shrink-0 overflow-hidden">
                                    <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{item.name}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Qtd: {item.quantity}</span>
                                        <span className="font-bold text-slate-900 dark:text-white">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment & Total */}
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Pagamento</h3>
                    <div className="flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-100 rounded p-2"><span className="material-symbols-outlined text-slate-600">credit_card</span></div>
                            <div>
                                <p className="font-bold text-sm">{paymentLabel}</p>
                                <p className="text-xs text-slate-500">{paymentMethodId === 'pix' ? `Desconto de ${(pixDiscountPercent * 100).toFixed(0)}% aplicado` : 'Crédito à vista'}</p>
                            </div>
                        </div>
                        <button className="text-primary text-sm font-bold" onClick={() => navigate('/checkout/payment')}>Alterar</button>
                    </div>

                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span className="text-slate-900 font-medium">R$ {subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm text-slate-500"><span>Frete</span><span className="text-slate-900 font-medium">R$ {shipping.toFixed(2)}</span></div>
                        {finalDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600"><span>Desconto PIX</span><span className="font-bold">- R$ {finalDiscount.toFixed(2)}</span></div>
                        )}
                        <div className="h-px bg-slate-100 dark:bg-slate-700"></div>
                        <div className="flex justify-between text-base font-bold"><span className="text-slate-900 dark:text-white">Total</span><span className="text-primary">R$ {total.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 max-w-md mx-auto z-20">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Total a pagar</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">R$ {total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={cart.length === 0}
                        className={`flex-1 font-bold h-12 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform ${cart.length > 0
                            ? 'bg-primary hover:bg-primary-dark text-white active:scale-[0.98]'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                            }`}
                    >
                        <span>Confirmar Pedido</span>
                        <span className="material-symbols-outlined">check</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummaryScreen;
