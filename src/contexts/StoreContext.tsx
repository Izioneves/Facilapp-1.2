import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { useCart } from './CartContext';
import { useData } from './DataContext';
import { User, Product, Order, CartItem, Address, PaymentMethod, ChatMessage } from '../types';

// Re-export types if needed, or import from types
// Bridge interface
interface StoreContextType {
  user: User | null;
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  deliveryFee: number;
  deliveryDistance: number;
  deliveryStatus: 'free' | 'paid' | 'out_of_range' | 'location_unknown' | null;
  checkDelivery: (storeId: string) => Promise<void>;
  setUser: (user: User | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, delta: number) => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addOrder: (order: Order) => void;
  createOrder: (data?: any) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  login: (email: string, password: string, role: 'client' | 'supplier') => Promise<boolean>;
  register: (user: User) => Promise<boolean>;
  logout: () => void;
  checkoutState: { deliveryAddress: Address | null, paymentMethod: string | null };
  setDeliveryAddress: (address: Address) => void;
  setPaymentMethod: (methodId: string) => void;
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  messages: ChatMessage[];
  sendMessage: (orderId: string, text: string) => void;
  markAsRead: (messageId: string) => void;
  isLoading: boolean;
  error: string | null;
  fetchAddressByCep: (cep: string) => Promise<Address | null>;
  stores: any[];
  isAuthLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { user, login, register, logout, isAuthLoading, setUser, error: authError } = useAuth();
  const { cart, addToCart, removeFromCart, updateCartQty, clearCart, deliveryFee, deliveryDistance, deliveryStatus, checkDelivery, checkoutState, setDeliveryAddress, setPaymentMethod, paymentMethods, addPaymentMethod, removePaymentMethod, createOrder: cartCreateOrder, error: cartError, isLoading: cartLoading } = useCart();
  const { products, stores, orders, isLoading: dataLoading, error: dataError, loadProducts, addProduct, updateProduct, deleteProduct, addOrder, updateOrderStatus, messages, sendMessage, markAsRead, fetchAddressByCep } = useData();

  // Unified Loading and Error
  const isLoading = isAuthLoading || cartLoading || dataLoading;
  const error = authError || cartError || dataError;

  const createOrderWrapper = async (data?: any) => {
    // Adapter if needed, but CartContext handle it internally usually
    return await cartCreateOrder();
  };

  const value = {
    user, products, orders, cart,
    deliveryFee, deliveryDistance, deliveryStatus,
    checkDelivery, setUser,
    addToCart, removeFromCart, updateCartQty,
    clearCart, addProduct, updateProduct, deleteProduct,
    addOrder, createOrder: createOrderWrapper, updateOrderStatus,
    login, register, logout, checkoutState,
    setDeliveryAddress, setPaymentMethod, paymentMethods,
    addPaymentMethod, removePaymentMethod, messages,
    sendMessage, markAsRead, isLoading, error,
    fetchAddressByCep, stores, isAuthLoading
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
