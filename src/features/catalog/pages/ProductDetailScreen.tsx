import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { useCart } from '../../../contexts/CartContext';

const ProductDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, addToCart, cart, stores, user } = useStore();

    const product = products.find(p => p.id === id);
    const store = stores.find(s => s.id === product?.storeId);
    const [localQty, setLocalQty] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    if (!product) return <div>Produto não encontrado</div>;

    const handleAddToCart = () => {
        addToCart(product, localQty);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
        navigate(-1); // Go back or stay? Usually stay or show feedback. Let's stay and show animation.
        // Or maybe go to cart?
        // Let's just show feedback and maybe navigate back if user wants (handled by header back button).
        // For now, I'll stay.
    };

    const incrementQty = () => setLocalQty(p => p + 1);
    const decrementQty = () => setLocalQty(p => p > 1 ? p - 1 : 1);

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark pb-20">
            <div className="bg-white dark:bg-surface-dark sticky top-0 z-10 p-4 flex justify-between items-center shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="font-bold text-base line-clamp-1 max-w-[200px]">{product.name}</h2>
                <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined">share</span>
                    </button>
                    {user?.type !== 'supplier' && (
                        <button
                            onClick={() => navigate('/client/cart')}
                            className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative text-primary transition-transform ${isAnimating ? 'scale-125' : ''}`}
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            {cart.length > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cart.length}</span>}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="bg-white dark:bg-surface-dark p-6 mb-2">
                    <div className="aspect-square bg-white flex items-center justify-center mb-6">
                        <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        {product.isOffer && <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">Mais Vendido</span>}
                        <div className="flex items-center gap-1 text-orange-400 text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px] filled">star</span>
                            <span>{product.rating} (1.2k)</span>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{product.name}</h1>

                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">R$ {product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                            <>
                                <span className="text-slate-400 text-sm line-through mb-1">R$ {product.originalPrice.toFixed(2)}</span>
                                <span className="text-green-600 font-bold text-sm bg-green-100 px-1.5 py-0.5 rounded mb-1">-16%</span>
                            </>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm">Preço por {product.unit || 'unidade'}.</p>
                </div>

                <div className="bg-white dark:bg-surface-dark p-4 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                            {store?.image || store?.image_url ? (
                                <img src={store.image || store.image_url} className="w-full h-full object-cover" alt={store.name} />
                            ) : (
                                <span className="material-symbols-outlined text-slate-400">storefront</span>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Vendido e entregue por</p>
                            <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{store?.name || 'Loja Parceira'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/client/store/${product.storeId}`)}
                        className="text-primary font-bold text-sm hover:underline"
                    >
                        Ver loja
                    </button>
                </div>

                <div className="bg-white dark:bg-surface-dark p-4 mb-6">
                    <h3 className="font-bold mb-2">Descrição do Produto</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
                    <button className="text-primary text-sm font-bold mt-2 flex items-center gap-1">
                        Ver ficha técnica completa
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    </button>
                </div>
            </div>

            {user?.type !== 'supplier' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto z-20">
                    <div className="flex gap-4">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg h-12 bg-slate-50 dark:bg-slate-800">
                            <button onClick={decrementQty} className="w-10 h-full flex items-center justify-center text-slate-500 text-xl font-bold hover:text-primary transition-colors">-</button>
                            <span className="w-8 text-center font-bold">{localQty}</span>
                            <button onClick={incrementQty} className="w-10 h-full flex items-center justify-center text-primary text-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">+</button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold h-12 rounded-lg shadow-md flex items-center justify-between px-6 active:scale-[0.98] transition-all"
                        >
                            <span>Adicionar</span>
                            <span>R$ {(product.price * localQty).toFixed(2)}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailScreen;
