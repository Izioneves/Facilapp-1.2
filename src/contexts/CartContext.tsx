import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, Address, PaymentMethod } from '../types';
import { storeService, orderService } from '../services/api';
import { useAuth } from '../features/auth/contexts/AuthContext';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateCartQty: (productId: string, delta: number) => void;
    clearCart: () => void;
    // Delivery
    deliveryFee: number;
    deliveryDistance: number;
    deliveryStatus: 'free' | 'paid' | 'out_of_range' | 'location_unknown' | null;
    checkDelivery: (storeId: string) => Promise<void>;
    // Checkout
    checkoutState: { deliveryAddress: Address | null, paymentMethod: string | null };
    setDeliveryAddress: (address: Address) => void;
    setPaymentMethod: (methodId: string) => void;
    paymentMethods: PaymentMethod[];
    addPaymentMethod: (method: PaymentMethod) => void;
    removePaymentMethod: (id: string) => void;
    createOrder: () => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [deliveryFee, setDeliveryFee] = useState(0);
    const [deliveryDistance, setDeliveryDistance] = useState(0);
    const [deliveryStatus, setDeliveryStatus] = useState<'free' | 'paid' | 'out_of_range' | 'location_unknown' | null>(null);

    const [checkoutState, setCheckoutState] = useState<{ deliveryAddress: Address | null, paymentMethod: string | null }>({
        deliveryAddress: null,
        paymentMethod: null
    });

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        { id: 'pix', type: 'pix', label: 'Pix (Aprovação imediata)', icon: 'qr_code_2' },
        { id: 'card_delivery_debit', type: 'card_delivery', label: 'Cartão de Débito (Na entrega)', icon: 'credit_card' },
        { id: 'card_delivery_credit', type: 'card_delivery', label: 'Cartão de Crédito (Na entrega)', icon: 'credit_card' },
        { id: 'cash', type: 'cash', label: 'Dinheiro na entrega', icon: 'payments' },
    ]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((i) => i.id !== productId));
    };

    const updateCartQty = (productId: string, delta: number) => {
        setCart((prev) =>
            prev.map((i) => {
                if (i.id === productId) {
                    const newQty = i.quantity + delta;
                    return newQty > 0 ? { ...i, quantity: newQty } : i;
                }
                return i;
            })
        );
    };

    const clearCart = () => setCart([]);

    const [currentStore, setCurrentStore] = useState<any>(null);

    const checkDelivery = async (storeId: string) => {
        if (!user?.address?.zipCode) {
            setDeliveryStatus('location_unknown');
            return;
        }

        let { location } = user.address;

        // Force refresh coordinates from CEP to ensure accuracy ("Logic established by the two CEPs")
        if (!location || !location.lat || !location.lng) {
            console.log("[CartContext] Location missing, fetching from CEP:", user.address.zipCode);
            try {
                const { cepService } = await import('../services/api');
                const coords = await cepService.fetchAddress(user.address.zipCode);
                if (coords && coords.lat && coords.lon) {
                    location = { lat: coords.lat, lng: coords.lon };
                    console.log("[CartContext] Resolved Coords:", location);
                }
            } catch (err) {
                console.error("[CartContext] Failed to resolve CEP:", err);
            }
        }

        if (!location?.lat || !location?.lng) {
            setDeliveryStatus('location_unknown');
            return;
        }

        const { lat, lng } = location;

        // Parallel Fetch: Delivery Calc + Store Details (for Finance Config)
        const [deliveryRes, storeRes] = await Promise.all([
            storeService.calculateDelivery(storeId, lat, lng),
            storeService.getById(storeId)
        ]);

        if (deliveryRes.error) {
            console.error("Delivery Calc Error", deliveryRes.error);
            return;
        }

        if (deliveryRes.data && deliveryRes.data.length > 0) {
            const info = deliveryRes.data[0];
            setDeliveryFee(Number(info.delivery_fee));
            setDeliveryDistance(Number(info.distance_km));
            setDeliveryStatus(info.status);
        }

        // Setup Store Finance Config
        if (storeRes.data) {
            const store = storeRes.data;
            setCurrentStore(store);

            // Dynamic Payment Methods
            const pixLabel = store.pix_discount > 0
                ? `Pix (Aprovação imediata - ${store.pix_discount}% OFF)`
                : 'Pix (Aprovação imediata)';

            const methods: PaymentMethod[] = [
                { id: 'pix', type: 'pix', label: pixLabel, icon: 'qr_code_2' },
                { id: 'card_delivery_debit', type: 'card_delivery', label: 'Cartão de Débito (Na entrega)', icon: 'credit_card' },
                { id: 'card_delivery_credit', type: 'card_delivery', label: 'Cartão de Crédito (Na entrega)', icon: 'credit_card' },
                { id: 'cash', type: 'cash', label: 'Dinheiro na entrega', icon: 'payments' }
            ];

            if (store.enable_boleto) {
                methods.push({ id: 'boleto', type: 'boleto', label: 'Boleto Bancário', icon: 'barcode' });
            }

            setPaymentMethods(methods);
        }
    };

    const createOrder = async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            if (!user) return false;

            // Security Guards
            if (cart.length === 0) {
                console.error("Security Block: Attempt to create order with empty cart.");
                return false;
            }

            const deliveryAddress = checkoutState.deliveryAddress || user.address;
            if (!deliveryAddress) {
                console.error("Security Block: Attempt to create order without delivery address.");
                return false;
            }



            const itemsBySupplier: Record<string, CartItem[]> = {};
            cart.forEach(item => {
                const sId = item.supplierId;
                if (!itemsBySupplier[sId]) itemsBySupplier[sId] = [];
                itemsBySupplier[sId].push(item);
            });

            let allSuccess = true;

            for (const sId in itemsBySupplier) {
                const items = itemsBySupplier[sId].map(i => ({ productId: i.id, quantity: i.quantity, price: i.price }));

                // Calculate Totals
                const subtotal = itemsBySupplier[sId].reduce((acc, item) => acc + (item.price * item.quantity), 0);
                const method = checkoutState.paymentMethod || 'CREDIT_CARD';

                let discount = 0;
                let storeConfig: any = null;

                // Get Store ID from the first item (Product interface has storeId)
                const targetStoreId = itemsBySupplier[sId][0].storeId;

                // Always fetch fresh store config to ensure accuracy
                if (targetStoreId) {
                    try {
                        const { data } = await storeService.getById(targetStoreId);
                        storeConfig = data;
                    } catch (err) {
                        console.error('Failed to fetch store config for order creation', err);
                    }
                }

                if (storeConfig) {
                    const pixDisc = storeConfig.pixDiscount || storeConfig.pix_discount || 0;
                    const cashDisc = storeConfig.cashDiscount || storeConfig.cash_discount || 0;

                    if (method === 'pix' && pixDisc > 0) {
                        discount = subtotal * (pixDisc / 100);
                    } else if (method === 'cash' && cashDisc > 0) {
                        discount = subtotal * (cashDisc / 100);
                    }
                }

                // Use global deliveryFee if it matches the store context, otherwise 0 to avoid error
                const finalDeliveryFee = (storeConfig && storeConfig.id === currentStore?.id) ? deliveryFee : 0;

                const totalAmount = subtotal + finalDeliveryFee - discount;

                const payload = {
                    clientUserId: user.id,
                    supplierId: sId,
                    items,
                    paymentMethodType: method,
                    deliveryAddress: {
                        ...(checkoutState.deliveryAddress || user.address),
                        distance: (storeConfig && storeConfig.id === currentStore?.id) ? deliveryDistance : 0
                    },
                    totalAmount: Math.max(0, totalAmount) // Prevent negative
                };

                const { error } = await orderService.create(payload);
                if (error) {
                    console.error("Order Create Error", error);
                    allSuccess = false;
                }
            }

            if (allSuccess) {
                clearCart();
                return true;
            } else {
                setError('Erro ao criar alguns pedidos');
                return false;
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao criar pedido');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const setDeliveryAddress = (address: Address) => setCheckoutState(prev => ({ ...prev, deliveryAddress: address }));
    const setPaymentMethod = (methodId: string) => setCheckoutState(prev => ({ ...prev, paymentMethod: methodId }));
    const addPaymentMethod = (method: PaymentMethod) => setPaymentMethods(prev => [...prev, method]);
    const removePaymentMethod = (id: string) => setPaymentMethods(prev => prev.filter(m => m.id !== id));

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateCartQty, clearCart,
            deliveryFee, deliveryDistance, deliveryStatus, checkDelivery,
            checkoutState, setDeliveryAddress, setPaymentMethod,
            paymentMethods, addPaymentMethod, removePaymentMethod,
            createOrder, isLoading, error
        }}>
            {children}
        </CartContext.Provider>
    );
};
