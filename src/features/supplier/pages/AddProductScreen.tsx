import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { Product } from '../../../types';

const SupplierAddProductScreen = () => {
    const navigate = useNavigate();
    const { addProduct, updateProduct, products, user } = useStore();

    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        minOrder: '1',
        active: true,
        image: 'https://placehold.co/400x400/png?text=Produto',
    });

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Load product if editing
    useEffect(() => {
        if (isEdit && id) {
            const existing = products.find(p => p.id === id);
            if (existing) {
                setFormData({
                    name: existing.name,
                    category: existing.category,
                    description: existing.description || '',
                    price: existing.price.toString(),
                    minOrder: existing.minOrder?.toString() || '1',
                    active: existing.active,
                    image: existing.image
                });
            }
        }
    }, [id, isEdit, products]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result as string;
                setFormData(prev => ({ ...prev, image: result }));
                const { data: publicUrl, error: uploadError } = await import('../../../services/api').then(m => m.storeService.uploadImage(file, 'products'));
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            alert('Preencha os campos obrigatórios (Nome, Categoria, Preço)');
            return;
        }

        setLoading(true);
        // Mock delay
        await new Promise(r => setTimeout(r, 800));

        if (isEdit && id) {
            updateProduct(id, {
                name: formData.name,
                price: parseFloat(formData.price.replace(',', '.')),
                category: formData.category,
                image: formData.image,
                description: formData.description,
                minOrder: parseInt(formData.minOrder) || 1,
                active: formData.active
            });
        } else {
            if (!user?.id) {
                alert("Erro: Usuário não identificado. Faça login novamente.");
                setLoading(false);
                return;
            }

            const newProduct: Product = {
                id: Math.floor(Math.random() * 1000000).toString(),
                name: formData.name,
                price: parseFloat(formData.price.replace(',', '.')),
                category: formData.category,
                image: formData.image,
                description: formData.description,
                supplierId: user.id, // removed hazardous fallback
                minOrder: parseInt(formData.minOrder) || 1,
                active: formData.active,
                rating: 5.0,
                reviews: 0,
                unit: 'un'
            };
            const result = await addProduct(newProduct);

            if (!result.success) {
                setLoading(false);
                const msg = result.error?.message || result.error?.details || JSON.stringify(result.error);
                alert(`Erro ao salvar produto: ${msg}`);
                return;
            }
        }

        setLoading(false);
        navigate('/supplier/products');
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold">{isEdit ? 'Editar Produto' : 'Cadastro de Produto'}</h1>
                <button onClick={() => navigate(-1)} className="text-primary font-bold text-base">Cancelar</button>
            </header>

            <main className="flex-1 w-full space-y-2">
                <section className="p-5 bg-white dark:bg-surface-dark">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-slate-900 dark:text-white">Fotos do Produto</h3>
                        <span className="text-xs text-slate-500">0/5 fotos</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={triggerFileInput}
                            className="shrink-0 size-24 rounded-xl border-2 border-dashed border-primary bg-primary/5 text-primary flex flex-col items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-3xl mb-1">add_a_photo</span>
                            <span className="text-[10px] font-bold uppercase">Adicionar</span>
                        </button>
                        {formData.image && !formData.image.includes('placehold.co') && (
                            <div className="shrink-0 size-24 rounded-xl relative overflow-hidden border border-slate-200 group">
                                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                <div className="absolute bottom-0 w-full bg-black/40 text-white text-[10px] text-center py-1 backdrop-blur-sm">Capa</div>
                                <button onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-[12px]">close</span>
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                <section className="p-5 bg-white dark:bg-surface-dark space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nome do produto *</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            type="text"
                            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                            placeholder="Ex: Detergente Clorado 5L"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria *</label>
                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 appearance-none"
                            >
                                <option value="" disabled>Selecione a categoria</option>
                                <option value="Limpeza">Limpeza</option>
                                <option value="Embalagens">Embalagens</option>
                                <option value="Descartáveis">Descartáveis</option>
                                <option value="Escritório">Escritório</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-3 text-slate-500 pointer-events-none">expand_more</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Descrição</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-32 resize-none"
                            placeholder="Detalhes técnicos..."
                        ></textarea>
                    </div>
                </section>

                <section className="p-5 bg-white dark:bg-surface-dark space-y-5">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Preço *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-slate-500 font-medium">R$</span>
                                <input
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    type="number" // Use number for simplicity or text with mask
                                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Qtd. Mínima</label>
                            <input
                                name="minOrder"
                                value={formData.minOrder}
                                onChange={handleChange}
                                type="number"
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                placeholder="1"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status do Produto</label>
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg h-12">
                            <button
                                onClick={() => setFormData(p => ({ ...p, active: true }))}
                                className={`flex-1 rounded-md text-sm font-bold flex items-center justify-center gap-1 transition-all ${formData.active ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                            >
                                <span className="material-symbols-outlined filled text-lg">check_circle</span> Ativo
                            </button>
                            <button
                                onClick={() => setFormData(p => ({ ...p, active: false }))}
                                className={`flex-1 rounded-md text-sm font-bold flex items-center justify-center gap-1 transition-all ${!formData.active ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-500'}`}
                            >
                                <span className="material-symbols-outlined text-lg">pause_circle</span> Inativo
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="fixed bottom-0 w-full bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 p-4 pb-6 z-40 max-w-md mx-auto">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70"
                >
                    {loading ? 'Salvando...' : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            Salvar produto
                        </>
                    )}
                </button>
            </footer>
        </div>
    );
};

export default SupplierAddProductScreen;
