import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';

interface ProductCardProps {
    product: Product;
    compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
    const navigate = useNavigate();
    const { addToCart, updateCartQty, cart } = useStore();
    const [isAnimating, setIsAnimating] = useState(false);

    const cartItem = cart.find(i => i.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product);
        // triggerAnimation(); // Removed to allow quantity selection feel
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (quantity === 0) addToCart(product);
        else updateCartQty(product.id, 1);
        triggerAnimation();
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateCartQty(product.id, -1);
    };

    const triggerAnimation = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <div
            className={`flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${compact ? 'w-36 shrink-0' : 'w-full'}`}
            onClick={() => navigate(`/product/${product.id}`)}
        >
            <div className={`relative ${compact ? 'aspect-square p-2' : 'aspect-square p-4'} bg-white flex items-center justify-center`}>
                {product.isOffer && <span className="absolute top-2 left-2 bg-accent-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded">-15%</span>}
                <img src={product.image} className="w-full h-full object-contain" alt={product.name} />
                {isAnimating && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-fly">
                        <div className="size-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined">shopping_cart</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 flex flex-col flex-1">
                <h3 className="text-xs font-medium text-slate-700 dark:text-white line-clamp-2 leading-tight mb-1 min-h-[2.5em]">{product.name}</h3>
                {compact && <p className="text-[10px] text-slate-400 mb-2 truncate">Marca Exemplo</p>}

                <div className="mt-auto">
                    {product.originalPrice && <p className="text-[10px] text-slate-400 line-through">R$ {product.originalPrice.toFixed(2)}</p>}
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">R$ {product.price.toFixed(2)}</p>

                    {quantity > 0 ? (
                        <div className="flex items-center justify-between bg-primary text-white rounded-lg h-8 px-1 shadow-md shadow-primary/20" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={handleDecrement}
                                className="w-8 h-full flex items-center justify-center hover:bg-white/20 rounded-md transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">remove</span>
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                            <button
                                onClick={handleIncrement}
                                className="w-8 h-full flex items-center justify-center hover:bg-white/20 rounded-md transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            className={`w-full bg-slate-100 dark:bg-slate-700 hover:bg-primary dark:hover:bg-primary text-slate-700 dark:text-slate-300 hover:text-white text-[10px] font-bold h-8 rounded-lg transition-all flex items-center justify-center gap-1`}
                            onClick={handleAdd}
                        >
                            <span>Adicionar</span>
                            <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
