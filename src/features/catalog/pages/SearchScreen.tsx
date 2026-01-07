import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import BottomNav from '../../../components/BottomNav';

const SearchScreen = () => {
    const navigate = useNavigate();
    const { products } = useStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const lowerTerm = searchTerm.toLowerCase();
        return products.filter(p =>
            p.active && (
                p.name.toLowerCase().includes(lowerTerm) ||
                p.category.toLowerCase().includes(lowerTerm) ||
                (p.supplierName && p.supplierName.toLowerCase().includes(lowerTerm))
            )
        );
    }, [searchTerm, products]);

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark min-h-screen">
            <div className="bg-white dark:bg-surface-dark p-4 shadow-sm sticky top-0 z-10">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">search</span>
                        <input
                            autoFocus
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="Buscar no FácilAPP"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-2 top-2 text-slate-400 p-1 hover:text-slate-600">
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </button>
                        )}
                    </div>
                    <button onClick={() => navigate(-1)} className="text-primary font-bold text-sm px-2">Voltar</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-4">
                {searchTerm.trim() ? (
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-slate-500 uppercase">{filteredProducts.length} Resultados encontrados</h2>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-70">
                                <span className="material-symbols-outlined text-[64px] text-slate-300 mb-4">search_off</span>
                                <h3 className="font-bold text-slate-600 dark:text-slate-300 text-lg">Ops! Nada encontrado.</h3>
                                <p className="text-sm text-slate-400 text-center max-w-xs mt-2">Tente buscar por termos mais genéricos como "limpeza" ou "papel".</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="p-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Sugestões para você</h3>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setSearchTerm('Oferta')} className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full text-primary text-sm font-bold">
                                    <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                                    Ofertas Relâmpago
                                </button>
                                <button onClick={() => setSearchTerm('Água Sanitária')} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 text-sm font-medium shadow-sm active:scale-95 transition-transform">Água Sanitária</button>
                                <button onClick={() => setSearchTerm('Sacos de Lixo')} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 text-sm font-medium shadow-sm active:scale-95 transition-transform">Sacos de Lixo</button>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Buscas Recentes</h3>
                                <button className="text-primary text-xs font-bold">Limpar</button>
                            </div>
                            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                {['Detergente 5L Neutro', 'Papel Toalha Interfolha', 'Desinfetante Floral'].map((item, i) => (
                                    <div key={i} onClick={() => setSearchTerm(item)} className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-[20px]">schedule</span>
                                            <span className="text-slate-700 dark:text-slate-200 text-sm">{item}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300 text-[18px]">north_west</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Navegue por Categorias</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div onClick={() => setSearchTerm('Limpeza')} className="p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform hover:border-primary/30">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">cleaning_services</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Limpeza Geral</p>
                                        <p className="text-xs text-slate-500">120+ produtos</p>
                                    </div>
                                </div>
                                <div onClick={() => setSearchTerm('Embalagens')} className="p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform hover:border-green-500/30">
                                    <div className="size-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <span className="material-symbols-outlined">inventory_2</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Embalagens</p>
                                        <p className="text-xs text-slate-500">Caixas e Sacolas</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchScreen;
