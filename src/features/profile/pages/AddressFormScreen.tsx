import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { useAuth } from '../../../contexts/AuthContext';
import { authService, cepService } from '../../../services/api';

const AddressFormScreen = () => {
    const navigate = useNavigate();
    const { user, setUser } = useStore();
    const location = useLocation();
    const initialData = location.state?.address || user?.address || {};

    useEffect(() => {
        console.log("[FORENSIC] AddressFormScreen Mounted");
        console.log("[FORENSIC] User:", user);
        console.log("[FORENSIC] Location State:", location.state);
        console.log("[FORENSIC] Initial Data:", initialData);
    }, []);

    const [formData, setFormData] = useState({
        street: initialData.street || '',
        number: initialData.number || '',
        neighborhood: initialData.neighborhood || '',
        city: initialData.city || 'São Paulo',
        state: initialData.state || 'SP',
        zipCode: initialData.zipCode || '',
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const updatedUser = { ...user, address: formData };

            // 1. Update Profile (Auth + DB) using centralized service
            const { error: dbError } = await authService.updateProfile(user.id, { address: formData });

            if (dbError) throw dbError;



            // 3. Local State Update
            setUser(updatedUser);
            alert("Endereço salvo com sucesso!");
            navigate('/addresses');
        } catch (error) {
            console.error("Failed to save address", error);
            alert("Erro ao salvar endereço. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">Editar Endereço</h1>
            </header>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    Ao salvar, este será seu endereço principal.
                </div>

                <Input
                    label="CEP"
                    value={formData.zipCode}
                    onChange={async (v) => {
                        setFormData(prev => ({ ...prev, zipCode: v }));
                        const zip = v.replace(/\D/g, '');
                        if (zip.length === 8) {
                            try {
                                const address = await cepService.fetchAddress(zip);
                                if (address) {
                                    setFormData(prev => ({
                                        ...prev,
                                        zipCode: v,
                                        street: address.street,
                                        neighborhood: address.neighborhood,
                                        city: address.city,
                                        state: address.state
                                    }));
                                }
                            } catch (e) {
                                console.error("CEP fetch failed", e);
                            }
                        }
                    }}
                />
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <Input label="Rua" value={formData.street} onChange={v => setFormData({ ...formData, street: v })} />
                    </div>
                    <Input label="Número" value={formData.number} onChange={v => setFormData({ ...formData, number: v })} />
                </div>
                <Input label="Bairro" value={formData.neighborhood} onChange={v => setFormData({ ...formData, neighborhood: v })} />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="Cidade" value={formData.city} onChange={v => setFormData({ ...formData, city: v })} />
                    <Input label="Estado" value={formData.state} onChange={v => setFormData({ ...formData, state: v })} />
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 z-20">
                <button
                    onClick={handleSave}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-12 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                    <span className="material-symbols-outlined">{saving ? 'sync' : 'save'}</span>
                    {saving ? 'Salvando...' : 'Salvar Endereço'}
                </button>
            </div>
        </div>
    );
};

const Input = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div>
        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{label}</label>
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-slate-200 bg-white dark:bg-surface-dark dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
    </div>
);

export default AddressFormScreen;
