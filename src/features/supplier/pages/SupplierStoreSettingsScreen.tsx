import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { storeService } from '../../../services/api';
import { mapStore } from '../../../utils/mapper';

interface SupplierStoreSettingsProps {
    onBack?: () => void;
    initialSection?: 'store' | 'delivery' | 'finance' | 'address';
}

const SupplierStoreSettingsScreen = ({ onBack, initialSection }: SupplierStoreSettingsProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, stores } = useStore();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [localStore, setLocalStore] = useState<any>(null);
    const [fetchError, setFetchError] = useState(false);

    // Section State - Check Props, then Location State, then Default
    const [activeSection, setActiveSection] = useState<'none' | 'store' | 'delivery' | 'finance' | 'address'>(
        initialSection || location.state?.initialSection || 'none'
    );

    const contextStore = stores.find(s => s.supplierId === user?.id);
    const myStore = localStore || contextStore;

    // Load store manually
    useEffect(() => {
        if (user?.id) {
            import('../../../services/api').then(api => {
                api.storeService.getMyStore(user.id).then(({ data, error }) => {
                    if (data) {
                        setLocalStore(mapStore(data));
                    } else {
                        console.error("Store Load Error:", error);
                        setFetchError(true);
                    }
                });
            });
        }
    }, [user?.id]);

    useEffect(() => {
        if (initialSection) setActiveSection(initialSection);
    }, [initialSection]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        // Address Fields
        zipCode: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        // Legacy/Fallback
        address: '',

        latitude: '',
        longitude: '',
        phone: '',
        email: user?.email || '',
        cnpj: user?.cnpj || '',
        minimum_order_value: '0',
        delivery_time_estimate: '40-60 min',
        free_delivery_enabled: false,
        free_delivery_radius_km: '0',
        delivery_price_per_km: '0',
        max_delivery_distance_km: '10',
        pix_discount_percentage: '0',
        cash_discount_percentage: '0',
        enable_boleto: false
    });

    useEffect(() => {
        if (myStore) {
            // Priority: Structured Data from address_json (via mapper's addressDetails)
            const details = myStore.addressDetails || {};

            // Legacy Fallback Logic
            let street = details.street || myStore.address || '';
            let number = details.number || '';
            let neighborhood = details.neighborhood || '';
            let city = details.city || '';
            let state = details.state || '';
            let zipCode = details.zipCode || '';

            // If we have no structured number but we have a legacy address string with comma
            if (!details.street && myStore.address && myStore.address.includes(',') && !street.includes(',')) {
                // The fallback above might have put the whole string in 'street'. Let's parse it if needed.
                // Actually myStore.address is the full string.
                const parts = myStore.address.split(',');
                if (parts.length >= 2) {
                    street = parts[0].trim();
                    const potentialNumber = parts[1].trim();
                    if (potentialNumber.length < 10) {
                        number = potentialNumber;
                    }
                }
            } else if (details.street) {
                // We have structured data, use it.
                street = details.street;
            } else if (myStore.address && !details.street) {
                // Fallback if no specific details but address string exists and didn't fall into comma trap
                street = myStore.address;
            }

            setFormData({
                name: myStore.name || '',
                description: myStore.description || '',
                image: myStore.image || '',

                // Address Mapping
                zipCode: zipCode,
                street: street,
                number: number,
                neighborhood: neighborhood,
                city: city,
                state: state,
                address: myStore.address || '',

                latitude: myStore.latitude?.toString() || '',
                longitude: myStore.longitude?.toString() || '',
                phone: myStore.phone || user?.phone || '',
                email: user?.email || '',
                cnpj: user?.cnpj || '',
                minimum_order_value: myStore.minOrder?.toString() || '0',
                delivery_time_estimate: myStore.deliveryTime || '40-60 min',
                free_delivery_enabled: myStore.freeDelivery || false,
                free_delivery_radius_km: myStore.freeDeliveryRadius?.toString() || '0',
                delivery_price_per_km: myStore.deliveryPrice?.toString() || '0',
                max_delivery_distance_km: myStore.maxDeliveryDistance?.toString() || '10',
                pix_discount_percentage: myStore.pixDiscount?.toString() || '0',
                cash_discount_percentage: myStore.cashDiscount?.toString() || '0',
                enable_boleto: myStore.enableBoleto || false
            });
        }
    }, [myStore, user]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const zip = raw.replace(/\D/g, '');

        // Always update state to allow typing
        setFormData(prev => ({ ...prev, zipCode: raw }));

        if (zip.length === 8) {
            try {
                const { cepService } = await import('../../../services/api');
                const address = await cepService.fetchAddress(zip);
                if (address) {
                    setFormData(prev => ({
                        ...prev,
                        street: address.street,
                        neighborhood: address.neighborhood,
                        city: address.city,
                        state: address.state,
                    }));
                }
            } catch (error) {
                console.error("CEP Error", error);
            }
        }
    };



    const handleSave = async () => {
        if (!myStore) return;
        setLoading(true);

        let lat = formData.latitude;
        let lng = formData.longitude;

        // Construct Full Address for Geocoding and Storage
        const fullAddress = `${formData.street}, ${formData.number} - ${formData.neighborhood}, ${formData.city} - ${formData.state}`;
        const cleanAddress = fullAddress.replace(/, - , -/g, '').trim();

        // Geocoding logic
        if (cleanAddress && (!lat || !lng || cleanAddress !== myStore.address)) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    lat = parseFloat(data[0].lat);
                    lng = parseFloat(data[0].lon);
                    console.log("Geocoded Address:", lat, lng);
                }
            } catch (err) {
                console.warn("Geocoding failed:", err);
            }
        }

        const updates = {
            name: formData.name,
            description: formData.description,
            image_url: formData.image,
            // Save structured JSON
            address_json: {
                zipCode: formData.zipCode,
                street: formData.street,
                number: formData.number,
                neighborhood: formData.neighborhood,
                city: formData.city,
                state: formData.state
            },
            latitude: lat,
            longitude: lng,
            minimum_order_value: parseFloat(formData.minimum_order_value),
            delivery_time_estimate: formData.delivery_time_estimate,
            free_delivery_enabled: formData.free_delivery_enabled,
            free_delivery_radius_km: parseFloat(formData.free_delivery_radius_km),
            delivery_price_per_km: parseFloat(formData.delivery_price_per_km),
            max_delivery_distance_km: parseFloat(formData.max_delivery_distance_km),
            pix_discount: parseFloat(formData.pix_discount_percentage),
            cash_discount: parseFloat(formData.cash_discount_percentage),
            enable_boleto: formData.enable_boleto
        };

        const { error } = await storeService.update(myStore.id, updates);

        setLoading(false);
        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            alert('Configurações salvas!');
            setLocalStore({
                ...myStore,
                ...updates,
                image: updates.image_url,
                address: cleanAddress,
                addressDetails: updates.address_json, // Ensure local update
                minOrder: updates.minimum_order_value,
                deliveryTime: updates.delivery_time_estimate,
                freeDelivery: updates.free_delivery_enabled,
                freeDeliveryRadius: updates.free_delivery_radius_km,
                deliveryPrice: updates.delivery_price_per_km,
                maxDeliveryDistance: updates.max_delivery_distance_km,
                pixDiscount: updates.pix_discount,
                cashDiscount: updates.cash_discount,
                enableBoleto: updates.enable_boleto
            });
            // Navigate back to sections menu
            setActiveSection('none');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (Same as before, simplified for this rewrite to keep it cleaner? No, keep it working)
        if (!e.target.files || !e.target.files[0] || !myStore) return;
        const file = e.target.files[0];
        setUploadingImage(true);

        try {
            const { storeService } = await import('../../../services/api');
            const { data: publicUrl, error: uploadError } = await storeService.uploadImage(file, myStore.id);

            if (uploadError) {
                alert('Erro ao enviar imagem: ' + uploadError.message);
            } else if (publicUrl) {
                setFormData(prev => ({ ...prev, image: publicUrl }));
            }
        } catch (err: any) {
            console.error(err);
            alert('Erro ao enviar imagem.');
        } finally {
            setUploadingImage(false);
        }
    };

    const goBack = () => {
        if (activeSection !== 'none' && !initialSection && !location.state?.initialSection) {
            setActiveSection('none');
        } else {
            if (onBack) onBack();
            else navigate(-1);
        }
    };

    if (!myStore) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-primary animate-pulse mb-4">storefront</span>
                <h2 className="text-lg font-bold mb-2">Carregando sua Loja...</h2>
                <div className="flex gap-3 mt-4">
                    <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-full font-bold">Voltar</button>
                </div>
            </div>
        );
    }

    const getTitle = () => {
        switch (activeSection) {
            case 'store': return 'Dados da Loja';
            case 'delivery': return 'Regras de Entrega';
            case 'finance': return 'Financeiro';
            case 'address': return 'Meu Endereço';
            default: return 'Configurar Loja';
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                <button onClick={goBack} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">{getTitle()}</h1>
            </header>

            <div className="p-4 space-y-6">

                {/* MENU SECTION */}
                {activeSection === 'none' && (
                    <div className="grid grid-cols-1 gap-4 animate-fade-in">
                        <div onClick={() => setActiveSection('store')} className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-4">
                            <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
                                <span className="material-symbols-outlined">store</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Dados da Loja</h3>
                                <p className="text-xs text-slate-500">Nome, descrição e contato</p>
                            </div>
                        </div>

                        <div onClick={() => setActiveSection('address')} className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-4">
                            <div className="bg-orange-50 text-orange-600 p-3 rounded-full">
                                <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Meu Endereço</h3>
                                <p className="text-xs text-slate-500">Endereço de origem para entregas</p>
                            </div>
                        </div>

                        <div onClick={() => setActiveSection('delivery')} className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-4">
                            <div className="bg-green-50 text-green-600 p-3 rounded-full">
                                <span className="material-symbols-outlined">local_shipping</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Regras de Entrega</h3>
                                <p className="text-xs text-slate-500">Taxas, raio e tempo estimado</p>
                            </div>
                        </div>

                        <div onClick={() => setActiveSection('finance')} className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-4">
                            <div className="bg-purple-50 text-purple-600 p-3 rounded-full">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Financeiro</h3>
                                <p className="text-xs text-slate-500">Descontos Pix/Dinheiro</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADDRESS SECTION (New) */}
                {activeSection === 'address' && (
                    <section className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm space-y-4 animate-fade-in">
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100 flex items-start gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">info</span>
                            <span>Este endereço será usado como base para cálculo do frete e distância para o cliente.</span>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Endereço Completo</label>
                            <textarea
                                className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={formData.address}
                                onChange={e => handleChange('address', e.target.value)}
                                rows={3}
                                placeholder="Ex: Rua das Flores, 123, Centro, Cidade - UF"
                            />
                        </div>
                    </section>
                )}


                {/* Basic Info Section */}
                {activeSection === 'store' && (
                    <section className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm space-y-4 animate-fade-in">

                        {/* Cover Photo */}
                        <div className="relative h-40 bg-slate-100 rounded-lg overflow-hidden group">
                            {formData.image ? (
                                <img src={formData.image} alt="Capa" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <span className="material-symbols-outlined text-4xl">image</span>
                                    <span className="text-xs font-bold mt-2">Sem Foto de Capa</span>
                                </div>
                            )}

                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined">{uploadingImage ? 'progress_activity' : 'upload'}</span>
                                    {uploadingImage ? 'Enviando...' : 'Alterar Foto'}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500">Nome da Loja</label>
                            <input className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Descrição</label>
                            <textarea className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200" value={formData.description} onChange={e => handleChange('description', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">CNPJ</label>
                            <input className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200" value={formData.cnpj} onChange={e => handleChange('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Email de Contato</label>
                            <input className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Telefone / WhatsApp</label>
                            <input className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                        </div>
                        {/* Address Removed from here */}
                        <div>
                            <label className="text-xs font-bold text-slate-500">Tempo de Entrega (Estimado)</label>
                            <input className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200" value={formData.delivery_time_estimate} onChange={e => handleChange('delivery_time_estimate', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Pedido Mínimo (R$)</label>
                            <input type="number" className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200" value={formData.minimum_order_value} onChange={e => handleChange('minimum_order_value', e.target.value)} />
                        </div>
                    </section>
                )}

                {/* Delivery Config Section - Split Layout */}
                {activeSection === 'delivery' && (
                    <div className="space-y-6 animate-fade-in">

                        {/* Section 1: Address Origin Form */}
                        <section className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm space-y-4">
                            <h2 className="font-bold text-base border-b pb-2 mb-2">Origem da Entrega</h2>

                            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100 flex items-start gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">info</span>
                                <span>Preencha o endereço completo para garantir o cálculo correto do frete.</span>
                            </div>

                            <div className="space-y-3">
                                <div className="w-1/3 min-w-[150px]">
                                    <label className="text-xs font-bold text-slate-500">CEP</label>
                                    <input
                                        className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="00000-000"
                                        maxLength={9}
                                        value={formData.zipCode}
                                        onChange={handleCepChange}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-3/4">
                                        <label className="text-xs font-bold text-slate-500">Rua / Logradouro</label>
                                        <input
                                            className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.street}
                                            onChange={e => handleChange('street', e.target.value)}
                                            placeholder="Ex: Av. Paulista"
                                        />
                                    </div>
                                    <div className="w-1/4">
                                        <label className="text-xs font-bold text-slate-500">Número</label>
                                        <input
                                            className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.number}
                                            onChange={e => handleChange('number', e.target.value)}
                                            placeholder="123"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Bairro</label>
                                        <input
                                            className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.neighborhood}
                                            onChange={e => handleChange('neighborhood', e.target.value)}
                                            placeholder="Centro"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Cidade</label>
                                        <input
                                            className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.city}
                                            onChange={e => handleChange('city', e.target.value)}
                                            placeholder="São Paulo"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">UF</label>
                                        <input
                                            className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                                            value={formData.state}
                                            onChange={e => handleChange('state', e.target.value)}
                                            placeholder="SP"
                                            maxLength={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Delivery Rules */}
                        <section className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm space-y-4">
                            <h2 className="font-bold text-base border-b pb-2 mb-2">Regras de Entrega</h2>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="font-medium text-sm">Entrega Grátis Ativa?</span>
                                <input
                                    type="checkbox"
                                    className="size-5 accent-primary"
                                    checked={formData.free_delivery_enabled}
                                    onChange={e => handleChange('free_delivery_enabled', e.target.checked)}
                                />
                            </div>

                            {formData.free_delivery_enabled && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Raio para Grátis (km)</label>
                                    <input type="number" className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200" value={formData.free_delivery_radius_km} onChange={e => handleChange('free_delivery_radius_km', e.target.value)} />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Preço por Km (R$)</label>
                                    <input type="number" className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200" value={formData.delivery_price_per_km} onChange={e => handleChange('delivery_price_per_km', e.target.value)} />
                                    <p className="text-[10px] text-slate-400 mt-1">Cobrado por km excedente.</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500">Raio Máximo (km)</label>
                                    <input type="number" className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200" value={formData.max_delivery_distance_km} onChange={e => handleChange('max_delivery_distance_km', e.target.value)} />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Finance Config Section */}
                {activeSection === 'finance' && (
                    <section className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm space-y-6 animate-fade-in">
                        {/* ... (Finance section content preserved) */}
                        <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm border border-green-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600">verified</span>
                            <span>Estes descontos são aplicados automaticamente no checkout do cliente.</span>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Desconto no PIX (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 p-3 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
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
                                        className="w-full bg-slate-50 p-3 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.cash_discount_percentage}
                                        onChange={e => handleChange('cash_discount_percentage', e.target.value)}
                                        placeholder="0"
                                    />
                                    <span className="absolute right-3 top-3 text-slate-400 font-bold">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-sm block">Aceitar Boleto Bancário</span>
                                    <span className="text-xs text-slate-400">Sujeito a aprovação de crédito.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="size-5 accent-primary"
                                    checked={formData.enable_boleto}
                                    onChange={e => handleChange('enable_boleto', e.target.checked)}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {activeSection !== 'none' && (
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 animate-slide-up"
                    >
                        {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
                        Salvar Configurações
                    </button>
                )}
            </div>
        </div>
    );
};

export default SupplierStoreSettingsScreen;
