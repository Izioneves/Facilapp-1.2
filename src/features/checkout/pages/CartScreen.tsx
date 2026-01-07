
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { useCart } from '../../../contexts/CartContext';

const CartScreen = () => {
    const navigate = useNavigate();
    const { cart, updateCartQty, removeFromCart, clearCart, user, deliveryFee, deliveryStatus, deliveryDistance } = useStore();

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = deliveryStatus === 'free' ? 0 : deliveryFee;
    const total = subtotal + shipping;

    const handleUpdateQty = (itemId: string, currentQty: number, delta: number) => {
        if (currentQty + delta <= 0) {
            if (window.confirm('Remover este item do carrinho?')) {
                removeFromCart(itemId);
            }
        } else {
            updateCartQty(itemId, delta);
        }
    };

    const handleClearCart = () => {
        if (window.confirm('Tem certeza que deseja esvaziar o carrinho?')) {
            clearCart();
        }
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col h-screen items-center justify-center p-6 text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <span className="material-symbols-outlined text-4xl text-slate-400">shopping_cart_off</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Sua cesta está vazia</h2>
                <p className="text-slate-500 mt-2 mb-6">Adicione produtos para começar seu pedido.</p>
                <button onClick={() => navigate('/client/home')} className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/30">
                    Ir às compras
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">Carrinho</h1>
                <button onClick={handleClearCart} className="ml-auto text-primary text-sm font-bold cursor-pointer hover:bg-slate-50 px-2 py-1 rounded">
                    Limpar
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Address Banner */}
                <div className="bg-primary/10 p-3 rounded-xl flex items-center justify-between border border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-full text-primary">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Entregar em</p>
                            <p className="text-sm font-bold text-slate-900 truncate w-40">
                                {user?.address
                                    ? `${user.address.street}, ${user.address.number} `
                                    : 'Endereço não informado'}
                            </p>
                            {deliveryDistance > 0 && (
                                <p className="text-[10px] text-primary font-bold mt-0.5">
                                    Distância: {deliveryDistance.toFixed(1)} km
                                </p>
                            )}
                        </div>
                    </div>
                    <span className="text-primary text-xs font-bold cursor-pointer" onClick={() => navigate('/addresses')}>Alterar</span>
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-sm">storefront</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Itens do Pedido</span>
                    </div>

                    {cart.map((item) => (
                        <div key={item.id} className="p-4 flex gap-4 border-b border-slate-50 dark:border-slate-700 last:border-0 relative group">
                            <div className="w-16 h-16 bg-slate-50 rounded-lg shrink-0 p-1">
                                <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="pr-6">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{item.name}</p>
                                    <p className="text-xs text-slate-400">{item.unit}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-base font-bold text-primary">R$ {item.price.toFixed(2)}</p>
                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg h-8">
                                        <button
                                            onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                                            className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-primary active:bg-slate-200 rounded-l-lg transition-colors"
                                        >
                                            {item.quantity === 1 ? <span className="material-symbols-outlined text-[16px]">delete</span> : '-'}
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                        <button onClick={() => handleUpdateQty(item.id, item.quantity, 1)} className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-primary active:bg-slate-200 rounded-r-lg transition-colors">+</button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1 rounded-full hover:bg-slate-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Resumo do Pedido</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal ({cart.length} itens)</span>
                            <span className="font-medium text-slate-900 dark:text-white">R$ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Frete</span>
                            <span className="font-medium text-green-600">R$ {shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Descontos</span>
                            <span className="font-medium text-green-600">- R$ 0,00</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="bg-white dark:bg-surface-dark p-4 border-t border-slate-100 dark:border-slate-800 fixed bottom-16 left-0 right-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto">
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <p className="text-xs text-slate-500">Total a pagar</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ {total.toFixed(2)}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/checkout/address')}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                    <span>Finalizar Compra</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default CartScreen;
