import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { User } from '../../types';

const SupplierRegisterScreen = () => {
    const navigate = useNavigate();
    const { register, fetchAddressByCep } = useStore();
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);

    const [supplierData, setSupplierData] = useState({
        companyName: '',
        cnpj: '',
        responsible: '',
        phone: '',
        email: '',
        password: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip: '',
        category: '',
        confirmPassword: ''
    });

    const handleCepBlur = async () => {
        const cep = supplierData.zip.replace(/\D/g, '');
        if (cep.length === 8) {
            setCepLoading(true);
            const address = await fetchAddressByCep(cep);
            setCepLoading(false);

            if (address) {
                setSupplierData(prev => ({
                    ...prev,
                    street: address.street,
                    neighborhood: address.neighborhood,
                    city: address.city,
                    state: address.state
                }));
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (supplierData.password !== supplierData.confirmPassword) {
                alert("As senhas não coincidem!");
                setLoading(false);
                return;
            }

            if (supplierData.password.length < 6) {
                alert("A senha deve ter pelo menos 6 caracteres.");
                setLoading(false);
                return;
            }

            const newUser: User = {
                id: `supplier-${Date.now()}`,
                type: 'supplier',
                name: supplierData.responsible,
                companyName: supplierData.companyName,
                email: supplierData.email,
                password: supplierData.password,
                cnpj: supplierData.cnpj,
                phone: supplierData.phone,
                categories: [supplierData.category],
                address: {
                    street: supplierData.street, number: supplierData.number,
                    neighborhood: supplierData.neighborhood, city: supplierData.city,
                    state: supplierData.state, zipCode: supplierData.zip
                }
            };

            // 1. Fetch Coordinates
            try {
                if (supplierData.street && supplierData.city) {
                    const query = `${supplierData.street}, ${supplierData.number}, ${supplierData.city} - ${supplierData.state}, Brazil`;
                    const { cepService } = await import('../../../services/api');
                    const { lat, lon } = await cepService.getCoordinates(query);
                    if (lat && lon) {
                        newUser.location = { lat, lng: lon };
                    }
                }
            } catch (err) {
                console.warn("Geo fetch failed", err);
            }

            const success = await register(newUser);
            if (success) {
                navigate('/supplier/dashboard');
            }
        } catch (error) {
            console.error("Supplier registration failed", error);
            alert("Erro ao cadastrar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 flex flex-col">
            <header className="flex items-center gap-2 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Cadastro de Fornecedor</h1>
            </header>

            <form className="space-y-4 flex-1 overflow-y-auto pb-4 hide-scrollbar" onSubmit={handleSave}>
                <SectionTitle icon="store" title="Dados da Empresa" />
                <Input label="Nome da Empresa" value={supplierData.companyName} onChange={v => setSupplierData({ ...supplierData, companyName: v })} />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="CNPJ" value={supplierData.cnpj} onChange={v => setSupplierData({ ...supplierData, cnpj: v })} />
                    <Input label="Telefone" value={supplierData.phone} onChange={v => setSupplierData({ ...supplierData, phone: v })} />
                </div>
                <Input label="Nome do Responsável" value={supplierData.responsible} onChange={v => setSupplierData({ ...supplierData, responsible: v })} />
                <Input label="E-mail Comercial" type="email" value={supplierData.email} onChange={v => setSupplierData({ ...supplierData, email: v })} />
                <Input label="Senha" type="password" value={supplierData.password} onChange={v => setSupplierData({ ...supplierData, password: v })} />
                <Input label="Confirmar Senha" type="password" value={supplierData.confirmPassword} onChange={v => setSupplierData({ ...supplierData, confirmPassword: v })} />
                <Input label="Categoria Principal" value={supplierData.category} onChange={v => setSupplierData({ ...supplierData, category: v })} />

                <SectionTitle icon="location_on" title="Endereço Comercial" />
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                        <Input
                            label={cepLoading ? "Buscando..." : "CEP"}
                            value={supplierData.zip}
                            onChange={v => setSupplierData({ ...supplierData, zip: v })}
                            onBlur={handleCepBlur}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2"><Input label="Rua" value={supplierData.street} onChange={v => setSupplierData({ ...supplierData, street: v })} /></div>
                    <Input label="Número" value={supplierData.number} onChange={v => setSupplierData({ ...supplierData, number: v })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="Bairro" value={supplierData.neighborhood} onChange={v => setSupplierData({ ...supplierData, neighborhood: v })} />
                    <Input label="Cidade" value={supplierData.city} onChange={v => setSupplierData({ ...supplierData, city: v })} />
                </div>
                <Input label="Estado (UF)" value={supplierData.state} onChange={v => setSupplierData({ ...supplierData, state: v })} />

                <div className="pt-4 space-y-3 mt-auto">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Salvando...' : (
                            <>
                                <span>Criar Conta de Fornecedor</span>
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/login', { state: { role: 'SUPPLIER' } })}
                        className="w-full bg-transparent text-primary font-bold py-3 rounded-xl active:bg-slate-50 transition-all text-sm"
                    >
                        Já tenho conta (Entrar como Fornecedor)
                    </button>
                </div>
            </form>
        </div>
    );
};

const Input = ({ label, value, onChange, onBlur, type = "text" }: { label: string, value: string, onChange: (v: string) => void, onBlur?: () => void, type?: string }) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';

    return (
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{label}</label>
            <div className="relative">
                <input
                    type={isPassword ? (show ? 'text' : 'password') : type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onBlur={onBlur}
                    className="w-full px-4 py-3 rounded-xl border-slate-200 bg-white dark:bg-surface-dark dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">{show ? 'visibility' : 'visibility_off'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

const SectionTitle = ({ icon, title }: { icon: string, title: string }) => (
    <div className="flex items-center gap-2 text-primary mb-2 mt-2">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <h3 className="font-bold text-sm">{title}</h3>
    </div>
);

export default SupplierRegisterScreen;
