import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { storeService } from '../../../services/api';

const SupplierStatementScreen = () => {
    const navigate = useNavigate();
    const { user, stores } = useStore();
    const [loading, setLoading] = useState(false);

    // Store Data
    const contextStore = stores.find(s => s.supplierId === user?.id);
    const [localStore, setLocalStore] = useState<any>(null);
    const myStore = localStore || contextStore;

    // Form State
    const [formData, setFormData] = useState({
        pix_discount_percentage: '0',
        cash_discount_percentage: '0',
        enable_boleto: false,
        minimum_order_value: '0'
    });

    // Load Data

    // Load Data - Always fetch fresh to ensure settings are up to date
    useEffect(() => {
        if (user?.id) {
            import('../../../services/api').then(api => {
                api.storeService.getMyStore(user.id).then(({ data }) => {
                    if (data) setLocalStore(data);
                });
            });
        }
    }, [user?.id]);

    // Sync Form
    useEffect(() => {
        if (myStore) {
            // Helper to get value checking both camelCase (mapped) and snake_case (raw DB)
            const getVal = (camel: string, snake: string) => myStore[camel] ?? myStore[snake];

            setFormData({
                pix_discount_percentage: getVal('pixDiscount', 'pix_discount')?.toString() || '0',
                cash_discount_percentage: getVal('cashDiscount', 'cash_discount')?.toString() || '0',
                enable_boleto: getVal('enableBoleto', 'enable_boleto') || false,
                minimum_order_value: getVal('minOrder', 'min_order')?.toString() || '0'
            });
        }
    }, [myStore]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!myStore?.id) {
            alert("Erro: Loja não identificada.");
            return;
        }
        setLoading(true);

        const pixDiscount = parseFloat(formData.pix_discount_percentage);
        const cashDiscount = parseFloat(formData.cash_discount_percentage);
        const minOrder = parseFloat(formData.minimum_order_value);

        const updates = {
            pix_discount: isNaN(pixDiscount) ? 0 : pixDiscount,
            cash_discount: isNaN(cashDiscount) ? 0 : cashDiscount,
            enable_boleto: formData.enable_boleto,
            min_order: isNaN(minOrder) ? 0 : minOrder
        };

        console.log("Saving Finance Config:", updates, "for Store ID:", myStore.id);

        const { data, error } = await storeService.update(myStore.id, updates);

        if (error) {
            console.error("Save Error:", error);
            alert('Erro ao salvar: ' + error.message);
        } else {
            // alert('Configurações Financeiras Salvas!');
            // Use a Toast or cleaner feedback if possible, but alert is fine for now.
            // Ensure local state mirrors the sanitized values
            setLocalStore(prev => ({
                ...prev,
                pixDiscount: updates.pix_discount,
                cashDiscount: updates.cash_discount,
                enableBoleto: updates.enable_boleto,
                minOrder: updates.min_order
            }));
            alert('Configurações Salvas com Sucesso! ✅\nDescontos já estão valendo no Checkout.');
        }
        setLoading(false);
    };

    if (!myStore) return <div className="p-10 text-center">Carregando...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <header className="bg-white dark:bg-surface-dark p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">Configuração Financeira</h1>
            </header>

            <div className="p-4 space-y-6 max-w-lg mx-auto w-full">

                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4">
                    <p className="font-bold mb-1">Como funciona:</p>
                    <p>Defina descontos automáticos para incentivar pagamentos à vista. O cálculo é feito automaticamente no checkout do cliente.</p>
                </div>

                {/* Simulator */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Simulação (Exemplo R$ 100,00)</h3>
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span>Cliente paga no PIX:</span>
                        <span className="font-bold text-green-600">
                            R$ {(100 - (parseFloat(formData.pix_discount_percentage) || 0)).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span>Cliente paga no Dinheiro:</span>
                        <span className="font-bold text-green-600">
                            R$ {(100 - (parseFloat(formData.cash_discount_percentage) || 0)).toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Desconto no PIX (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full bg-white p-3 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.pix_discount_percentage}
                                onChange={e => handleChange('pix_discount_percentage', e.target.value)}
                                placeholder="0"
                            />
                            <span className="absolute right-3 top-3 text-slate-400 font-bold">%</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Desconto no Dinheiro (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full bg-white p-3 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.cash_discount_percentage}
                                onChange={e => handleChange('cash_discount_percentage', e.target.value)}
                                placeholder="0"
                            />
                            <span className="absolute right-3 top-3 text-slate-400 font-bold">%</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Pedido Mínimo (R$)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-400 font-bold">R$</span>
                            <input
                                type="number"
                                className="w-full bg-white p-3 pl-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.minimum_order_value}
                                onChange={e => handleChange('minimum_order_value', e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-bold text-sm block">Aceitar Boleto Bancário</span>
                            <span className="text-xs text-slate-400 block">Opção aparecerá no checkout.</span>
                            <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-1 rounded">Requer aprovação manual (Futuro)</span>
                        </div>
                        <input
                            type="checkbox"
                            className="size-5 accent-primary"
                            checked={formData.enable_boleto}
                            onChange={e => handleChange('enable_boleto', e.target.checked)}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                    {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
                    Salvar Configurações
                </button>
            </div>
        </div>
    );
};

export default SupplierStatementScreen;
