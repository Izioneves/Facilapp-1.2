import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useStore } from '../../../contexts/StoreContext';

const CheckoutAddressScreen = () => {
    const navigate = useNavigate();
    const { user, checkoutState, setDeliveryAddress } = useStore();
    // Default to checkoutState address, fallback to user address
    const [selectedAddressId, setSelectedAddressId] = React.useState<string>(checkoutState.deliveryAddress?.street || user?.address?.street || '');

    // Initialize checkout state if empty but user has address
    React.useEffect(() => {
        if (!checkoutState.deliveryAddress && user?.address) {
            setDeliveryAddress(user.address);
        }
    }, [user, checkoutState.deliveryAddress]);

    const handleSelectAddress = () => {
        if (user?.address) {
            setDeliveryAddress(user.address);
            setSelectedAddressId(user.address.street);
        }
    };

    const currentAddress = checkoutState.deliveryAddress || user?.address;

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">Endereço de Entrega</h1>
            </header>

            {/* Progress */}
            <div className="bg-white dark:bg-surface-dark pb-6 pt-2 mb-4 shadow-sm">
                <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                    <div className="flex flex-col items-center gap-1">
                        <div className="size-6 rounded-full bg-green-500 text-white flex items-center justify-center"><span className="material-symbols-outlined text-sm font-bold">check</span></div>
                        <span className="text-[10px] font-bold text-green-600">Carrinho</span>
                    </div>
                    <div className="h-[2px] w-12 bg-primary rounded-full"></div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="size-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs ring-4 ring-primary/20">2</div>
                        <span className="text-[10px] font-bold text-primary">Entrega</span>
                    </div>
                    <div className="h-[2px] w-12 bg-slate-200 rounded-full"></div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="size-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">3</div>
                        <span className="text-[10px] font-bold text-slate-400">Pagar</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Onde você quer receber?</h2>

                <div className="space-y-3">
                    <label className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer relative ${selectedAddressId === user?.address?.street ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white dark:bg-surface-dark'}`}>
                        <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === user?.address?.street}
                            onChange={handleSelectAddress}
                            className="mt-1 accent-primary"
                        />
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                    <span className="material-symbols-outlined text-primary">home</span>
                                    Minha Casa
                                </div>
                                <span onClick={() => navigate('/addresses')} className="text-primary text-xs font-bold uppercase cursor-pointer hover:underline">Editar</span>
                            </div>
                            {currentAddress ? (
                                <>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{currentAddress.street}, {currentAddress.number}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{currentAddress.neighborhood} - {currentAddress.city}/{currentAddress.state}</p>
                                    <p className="text-xs text-slate-400 mt-1">CEP: {currentAddress.zipCode}</p>
                                </>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Nenhum endereço cadastrado</p>
                            )}
                        </div>
                    </label>
                </div>

                <div className="relative py-2 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <span className="relative bg-background-light dark:bg-background-dark px-2 text-xs text-slate-400 uppercase">Ou</span>
                </div>

                <button className="w-full py-4 border border-dashed border-primary/40 rounded-xl flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined">add</span>
                    Adicionar novo endereço
                </button>
            </div >

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 max-w-md mx-auto z-20">
                <div className="flex justify-between mb-4 px-1">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="material-symbols-outlined">local_shipping</span>
                        <span>Frete para {currentAddress?.neighborhood || 'seu endereço'}</span>
                    </div>
                    <span className="text-green-600 font-bold">Grátis</span>
                </div>
                <button
                    onClick={() => navigate('/checkout/payment')}
                    disabled={!selectedAddressId}
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${selectedAddressId
                        ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 active:scale-[0.98]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    <span>{selectedAddressId ? 'Continuar para Pagamento' : 'Selecione um Endereço'}</span>
                    {selectedAddressId && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
            </div>
        </div >
    );
};

export default CheckoutAddressScreen;
