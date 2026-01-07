import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Order, ChatMessage, Address } from '../types';
import { productService, orderService, cepService, storeService } from '../services/api';
import { mapProduct, mapOrder, mapStore } from '../utils/mapper';
import { useAuth } from '../features/auth/contexts/AuthContext';

interface DataContextType {
    products: Product[];
    stores: any[];
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    loadProducts: () => Promise<void>;
    addProduct: (product: Product) => void;
    updateProduct: (productId: string, updates: Partial<Product>) => void;
    deleteProduct: (productId: string) => void;
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    messages: ChatMessage[];
    sendMessage: (orderId: string, text: string) => void;
    markAsRead: (messageId: string) => void;
    fetchAddressByCep: (cep: string) => Promise<Address | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
        loadStores();
    }, []);

    useEffect(() => {
        if (user) {
            loadOrders(user.id, user.type);

            if (user.type === 'supplier') {
                storeService.getMyStore(user.id).then(({ data }) => {
                    if (data) {
                        setStores(prev => {
                            const exists = prev.find(s => s.id === data.id);
                            return exists ? prev : [data, ...prev];
                        });
                    }
                });
            }
        } else {
            setOrders([]);
        }
    }, [user]);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            console.log("DEBUG: Loading Products...");
            const { data, error } = await productService.list();
            console.log("DEBUG: Raw API Response:", data);

            if (error) {
                console.error("DEBUG: API Error:", error);
                throw error;
            }

            const mapped = Array.isArray(data) ? data.map(mapProduct) : [];
            console.log("DEBUG: Mapped Products:", mapped);
            setProducts(mapped);
        } catch (err: any) {
            console.error(err);
            setError('Erro ao carregar produtos');
        } finally {
            setIsLoading(false);
        }
    };

    const loadStores = async () => {
        try {
            const { data, error } = await storeService.listNearby(0, 0);
            if (error) {
                console.error("DEBUG: loadStores API Error:", error);
                setError('Erro ao carregar lojas: ' + error.message);
                return;
            }
            if (data) {
                console.log("DEBUG: loadStores Data:", data);
                setStores(data.map(mapStore));
            } else {
                console.warn("DEBUG: loadStores returned no data");
            }
        } catch (err: any) {
            console.error("DEBUG: loadStores Exception:", err);
            setError('Exceção ao carregar lojas: ' + err.message);
        }
    };

    const loadOrders = async (userId: string, type: 'client' | 'supplier') => {
        try {
            const res = type === 'client'
                ? await orderService.listClient(userId)
                : await orderService.listSupplier(userId);
            if (res.data) {
                setOrders(res.data.map(mapOrder));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const addProduct = async (product: Product): Promise<{ success: boolean; error?: any }> => {
        try {
            const payload = {
                supplierUserId: user?.id,
                name: product.name,
                description: product.description,
                price: product.price,
                unit: product.unit,
                stock: 100,
                image: product.image
            };
            console.log("DEBUG: Creating Product Payload:", payload);
            console.log("DEBUG: Current Context User:", user);
            const { data, error } = await productService.create(payload);
            if (error) {
                console.error("Create Product Error", error);
                return { success: false, error };
            }
            if (data) {
                setProducts(prev => [mapProduct(data), ...prev]);
                await loadProducts(); // Ensure server state is synced
                return { success: true };
            }
            return { success: false, error: "Unknown error" };
        } catch (err) {
            console.error(err);
            return { success: false, error: err };
        }
    };

    const updateProduct = async (productId: string, updates: Partial<Product>) => {
        // Optimistic Update
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));

        try {
            const { error } = await productService.update(productId, updates);
            if (error) {
                console.error("Update failed", error);
                // Revert or re-sync
                await loadProducts();
            }
        } catch (err) {
            console.error("Update exception", err);
        }
    };

    const deleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const addOrder = (order: Order) => {
        setOrders(prev => [order, ...prev]);
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        if (!user) return;
        try {
            await orderService.updateStatus(orderId, status, user.id);
            loadOrders(user.id, user.type);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAddressByCep = async (cep: string) => {
        const { data, error } = await cepService.fetchAddress(cep);
        if (data && !error) {
            return {
                street: data.logradouro,
                number: '',
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf,
                zipCode: cep
            } as Address;
        }
        return null;
    };

    const sendMessage = (orderId: string, text: string) => { };
    const markAsRead = (messageId: string) => { };

    return (
        <DataContext.Provider value={{
            products, stores, orders, isLoading, error, loadProducts,
            addProduct, updateProduct, deleteProduct, addOrder, updateOrderStatus,
            messages, sendMessage, markAsRead, fetchAddressByCep
        }}>
            {children}
        </DataContext.Provider>
    );
};
