import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { User } from '../../../types';
import { authService } from '../../../services/api';
import { supabase } from '../../../lib/supabaseClient';

const RegisterScreen = () => {
    const navigate = useNavigate();
    const { register, fetchAddressByCep } = useStore();
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);

    // Client Data
    const [clientData, setClientData] = useState({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        password: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip: '',
        confirmPassword: ''
    });

    const handleCepBlur = async () => {
        const cep = clientData.zip.replace(/\D/g, '');
        if (cep.length === 8) {
            setCepLoading(true);
            const address = await fetchAddressByCep(cep);
            setCepLoading(false);

            if (address) {
                setClientData(prev => ({
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
            if (clientData.password !== clientData.confirmPassword) {
                alert("As senhas não coincidem!");
                setLoading(false);
                return;
            }

            if (clientData.password.length < 6) {
                alert("A senha deve ter pelo menos 6 caracteres.");
                setLoading(false);
                return;
            }

            // 1. Fetch Coordinates
            let latitude: number | undefined;
            let longitude: number | undefined;

            try {
                if (clientData.street && clientData.city) {
                    const query = `${clientData.street}, ${clientData.number}, ${clientData.city} - ${clientData.state}, Brazil`;
                    // Dynamically import or just assume cepService is available via api
                    const { cepService } = await import('../../../services/api');
                    const { lat, lon } = await cepService.getCoordinates(query);
                    if (lat && lon) {
                        latitude = lat;
                        longitude = lon;
                    }
                }
            } catch (err) {
                console.warn("Geo fetch failed", err);
            }

            const newUser: User = {
                id: `client-${Date.now()}`,
                type: 'client',
                name: clientData.name,
                email: clientData.email,
                password: clientData.password,
                cpf: clientData.cpf,
                phone: clientData.phone,
                address: {
                    street: clientData.street, number: clientData.number,
                    neighborhood: clientData.neighborhood, city: clientData.city,
                    state: clientData.state, zipCode: clientData.zip
                },
                // Pass lat/lng to register function via User type (needs update) or handle in register function? 
                // register takes User object. 
                // I need to add lat/lng to User type OR handle it as metadata.
                // Let's add it to User type properties if possible or just pass in metadata logic inside register.
                // Ideally User type has location.
                location: (latitude && longitude) ? { lat: latitude, lng: longitude } : undefined
            };

            const success = await register(newUser);
            if (success) {
                navigate('/client/home');
            }
        } catch (error) {
            console.error("Registration failed", error);
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
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Cadastro de Cliente</h1>
            </header>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-4 text-sm flex gap-2">
                <span className="material-symbols-outlined text-base">info</span>
                <p>Você está criando uma conta para <b>comprar</b> produtos.</p>
            </div>

            <form className="space-y-4 flex-1 overflow-y-auto pb-4 hide-scrollbar" onSubmit={handleSave}>
                <SectionTitle icon="person" title="Dados Pessoais" />
                <Input label="Nome Completo" value={clientData.name} onChange={v => setClientData({ ...clientData, name: v })} />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="CPF" value={clientData.cpf} onChange={v => setClientData({ ...clientData, cpf: v })} />
                    <Input label="Telefone" value={clientData.phone} onChange={v => setClientData({ ...clientData, phone: v })} />
                </div>
                <Input label="E-mail" type="email" value={clientData.email} onChange={v => setClientData({ ...clientData, email: v })} />
                <Input label="Senha" type="password" value={clientData.password} onChange={v => setClientData({ ...clientData, password: v })} />
                <Input label="Confirmar Senha" type="password" value={clientData.confirmPassword} onChange={v => setClientData({ ...clientData, confirmPassword: v })} />

                <SectionTitle icon="location_on" title="Endereço Completo" />
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                        <Input
                            label={cepLoading ? "Buscando..." : "CEP"}
                            value={clientData.zip}
                            onChange={v => setClientData({ ...clientData, zip: v })}
                            onBlur={handleCepBlur}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2"><Input label="Rua" value={clientData.street} onChange={v => setClientData({ ...clientData, street: v })} /></div>
                    <Input label="Número" value={clientData.number} onChange={v => setClientData({ ...clientData, number: v })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="Bairro" value={clientData.neighborhood} onChange={v => setClientData({ ...clientData, neighborhood: v })} />
                    <Input label="Cidade" value={clientData.city} onChange={v => setClientData({ ...clientData, city: v })} />
                </div>
                <Input label="Estado (UF)" value={clientData.state} onChange={v => setClientData({ ...clientData, state: v })} />

                <div className="pt-4 space-y-3 mt-auto">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Salvando...' : (
                            <>
                                <span>Criar Minha Conta</span>
                                <span className="material-symbols-outlined text-[20px]">check</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/login', { state: { role: 'CLIENT' } })}
                        className="w-full bg-transparent text-primary font-bold py-3 rounded-xl active:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        <span>Já sou cliente (Entrar)</span>
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

export default RegisterScreen;
