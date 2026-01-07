
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { useCart } from '../../../contexts/CartContext';
import { calculateDistance, formatDistance } from '../../../utils/geo'; // Add distance utils if needed or rely on store data


const StoreScreen = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { products, addToCart, updateCartQty, cart, stores, user, checkDelivery, deliveryFee, deliveryStatus, deliveryDistance } = useStore();
    const [cartAnimating, setCartAnimating] = useState(false);

    React.useEffect(() => {
        if (id) {
            checkDelivery(id);
        }
    }, [id]);

    // Real Store Data
    const store = stores.find(s => s.id === id);
    // Filter products by Store ID (route param) AND active status (Client view)
    const storeProducts = products.filter(p => p.storeId === id && p.active);

    if (!store) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500">
                <p>Loja não encontrada</p>
            </div>
        );
    }


    const handleAddToCart = (e: React.MouseEvent, product: any) => {
        e.stopPropagation();
        addToCart(product);
        setCartAnimating(true);
        setTimeout(() => setCartAnimating(false), 300);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="relative h-40 bg-slate-200">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDxDgIZrJ9PktKI4tEjbIdfJMilsfIkVpaj5DokiVtXoD_8vu8_mFMGAMVf_LeI0WvLBcnd4GpVEWALCTnyzNyO605Acu0J_KBJAxGBXJEv4aG8p_3UCTHoPta4Fj4JmCpXvALvEOFjx6xYvlR9cAyHIiIc79QgOL52u0AkYUxEBS_dKLqYW6YpnRwAPOUOCISwwGkyvJksH797-Fuc0P8yAMqz0czojLKQLkeQXd9V2emvPQklxXrnpy9RH9IQb6-5ZQAJ2k9lQ" className="w-full h-full object-cover" alt="Cover" />
                <div className="absolute inset-0 bg-black/30"></div>
                <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-white/20 text-white backdrop-blur-md">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div
                    className={`absolute top - 4 right - 4 p - 2 rounded - full bg - white / 20 backdrop - blur - md transition - all cursor - pointer ${cartAnimating ? 'bg-green-500 scale-110' : ''} `}
                    onClick={() => navigate('/client/cart')}
                >
                    <span className="material-symbols-outlined text-white">shopping_cart</span>
                    {cart.length > 0 && (
                        <span className="absolute top-0 right-0 size-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white/20">
                            {cart.length}
                        </span>
                    )}
                </div>
            </header>

            <div className="px-4 -mt-10 relative z-10">
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                    <div className={`size - 20 rounded - full border - 4 border - white dark: border - surface - dark overflow - hidden - mt - 14 mb - 2 shadow - sm flex items - center justify - center ${store.image || store.image_url ? 'bg-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600'} `}>
                        {store.image || store.image_url ? (
                            <img src={store.image || store.image_url} className="w-full h-full object-cover" alt="Logo" />
                        ) : (
                            <span className="text-white font-bold text-2xl uppercase">
                                {store.name.substring(0, 2)}
                            </span>
                        )}
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">{store.name}</h1>
                    <p className="text-sm text-slate-500 mb-3">{store.category}</p>

                </div>
            </div>

            {/* Delivery Info Card */}
            <div className="px-4 mt-4">
                <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <span className="material-symbols-outlined">local_shipping</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                                Frete para {user?.address?.neighborhood || user?.address?.street || 'seu endereço'}
                            </p>
                            <p className="text-xs text-slate-500">
                                {deliveryStatus === 'location_unknown'
                                    ? 'Defina seu endereço'
                                    : deliveryDistance ? `${formatDistance(deliveryDistance)} de distância` : 'Calculando...'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        {deliveryStatus === 'free' ? (
                            <span className="text-green-600 font-bold text-lg">Grátis</span>
                        ) : deliveryStatus === 'out_of_range' ? (
                            <span className="text-red-500 font-bold text-sm">Não entrega</span>
                        ) : deliveryStatus === 'paid' ? (
                            <span className="text-slate-900 dark:text-white font-bold text-lg">R$ {deliveryFee.toFixed(2)}</span>
                        ) : (
                            <span className="text-slate-400 text-sm">--</span>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                    <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-sm font-bold shrink-0">
                        <span className="material-symbols-outlined text-[18px] filled">star</span>
                        {store.rating}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium shrink-0">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        {store.deliveryTime || '40-60 min'}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium shrink-0">
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        Min. R$ {store.minOrder}
                    </div>
                </div>
            </div>

            <div className="px-4 mt-6">
                <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Produtos ({storeProducts.length})</h2>
                <div className="grid grid-cols-2 gap-4">
                    {storeProducts.map(product => (
                        <div
                            key={product.id}
                            className="flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                            onClick={() => navigate(`/product/${product.id}`)}
                        >
                            <div className="aspect-square p-4 bg-white flex items-center justify-center relative">
                                {product.isOffer && <span className="absolute top-2 left-2 bg-accent-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded">-15%</span>}
                                <img src={product.image} className="w-full h-full object-contain" alt={product.name} />
                            </div>
                            <div className="p-3 flex flex-col flex-1">
                                <h3 className="text-xs font-medium text-slate-700 dark:text-white line-clamp-2 leading-tight mb-1">{product.name}</h3>
                                <div className="mt-auto pt-2">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">R$ {product.price.toFixed(2)}</p>
                                    {cart.find(i => i.id === product.id) ? (
                                        <div className="flex items-center justify-between bg-primary text-white rounded-lg h-8 px-1 mt-2 shadow-md shadow-primary/20" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateCartQty(product.id, -1);
                                                }}
                                                className="w-8 h-full flex items-center justify-center hover:bg-white/20 rounded-md transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">remove</span>
                                            </button>
                                            <span className="text-xs font-bold w-4 text-center">{cart.find(i => i.id === product.id)?.quantity || 0}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateCartQty(product.id, 1);
                                                }}
                                                className="w-8 h-full flex items-center justify-center hover:bg-white/20 rounded-md transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">add</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="w-full mt-2 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white text-[10px] font-bold py-1.5 rounded-lg active:bg-primary active:text-white transition-colors flex items-center justify-center gap-1"
                                            onClick={(e) => handleAddToCart(e, product)}
                                        >
                                            <span>Adicionar</span>
                                            <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StoreScreen;
