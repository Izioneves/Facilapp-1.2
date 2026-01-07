import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';

const SupplierProductsScreen = () => {
    const navigate = useNavigate();
    const { products, updateProduct, deleteProduct, user } = useStore();

    // In a real app, filtering would happen on the backend or context based on user ID.
    // Here we show all products or filter by "sup1" if we are assuming the user is "sup1" (or whatever the mock is)
    // For demo purposes, we'll try to match supplierId, or fallback to showing all if user has no products found (to keep demo populated)

    // RLS policies ensure the supplier only sees their own products.
    // We remove the redundant frontend filter to rely on the "Data Truth".
    const myProducts = products;

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        updateProduct(id, { active: !currentStatus });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold">Meus Produtos</h1>
                </div>
                <button onClick={() => navigate('/supplier/add-product')} className="text-primary font-bold text-sm flex items-center gap-1 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">add</span> Novo
                </button>
            </header>

            <div className="p-4 space-y-3">
                {myProducts.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="bg-slate-100 p-4 rounded-full inline-block mb-3">
                            <span className="material-symbols-outlined text-4xl text-slate-400">inventory_2</span>
                        </div>
                        <h3 className="text-slate-900 font-bold mb-1">Nenhum produto</h3>
                        <p className="text-slate-500 text-sm mb-4">Cadastre seus produtos para começar a vender.</p>
                        <button onClick={() => navigate('/supplier/add-product')} className="text-primary font-bold text-sm">Cadastrar agora</button>
                    </div>
                ) : (
                    myProducts.map(product => (
                        <div key={product.id} className="bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-3 group relative">
                            <div className="size-20 bg-slate-50 rounded-lg shrink-0 overflow-hidden relative">
                                <img src={product.image} className={`w-full h-full object-contain mix-blend-multiply ${!product.active ? 'grayscale opacity-50' : ''}`} alt={product.name} />
                                {!product.active && <div className="absolute inset-0 flex items-center justify-center bg-black/10"><span className="material-symbols-outlined text-slate-500">visibility_off</span></div>}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <ProductItemContent product={product} navigate={navigate} updateProduct={updateProduct} deleteProduct={deleteProduct} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const ProductItemContent = ({ product, navigate, updateProduct, deleteProduct }: any) => {
    const [showMenu, setShowMenu] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            deleteProduct(product.id);
        }
    };

    return (
        <>
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm line-clamp-1 text-slate-900 dark:text-white mb-0.5">{product.name}</h3>
                    <div className="relative" ref={menuRef}>
                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="text-slate-400 hover:text-slate-600 p-1 -mr-2 -mt-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-lg z-20 w-32 py-1 flex flex-col">
                                <button onClick={() => navigate(`/supplier/products/edit/${product.id}`)} className="text-left px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">edit</span> Editar
                                </button>
                                <button onClick={handleDelete} className="text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">delete</span> Excluir
                                </button>
                                <button onClick={() => { }} className="text-left px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">visibility</span> Detalhes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-slate-500">{product.category}</p>
            </div>
            <div className="flex justify-between items-center mt-2">
                <p className="font-bold text-slate-900 dark:text-white">R$ {product.price.toFixed(2)}</p>
                <button
                    onClick={() => updateProduct(product.id, { active: !product.active })}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 transition-colors ${product.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    <span className="size-1.5 rounded-full bg-current"></span>
                    {product.active ? 'Ativo' : 'Inativo'}
                </button>
            </div>
        </>
    );
};

export default SupplierProductsScreen;
