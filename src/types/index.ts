
export enum UserRole {
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER',
}

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string; // CEP
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'pix' | 'cash' | 'boleto' | 'card_delivery';
  label: string;
  icon: string;
  last4?: string; // for cards
}

export interface User {
  id: string;
  type: 'client' | 'supplier';
  name: string;
  email: string;
  password?: string; // For mock auth
  phone?: string;
  address?: Address;
  cpf?: string; // Client only
  cnpj?: string; // Supplier only
  companyName?: string; // Supplier only
  responsibleName?: string; // Supplier only
  categories?: string[]; // Supplier only
  avatar?: string;
  location?: { lat: number, lng: number };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  supplierId: string; // fornecedor_id
  storeId?: string; // Real Store ID
  supplierName?: string;
  rating?: number;
  reviews?: number;
  unit: string;
  minOrder?: number;
  deliveryTime?: string;
  active: boolean;
  isOffer?: boolean;
}

export interface Store {
  id: string;
  supplierId: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
  deliveryPrice: number;
  minOrder: number;
  distance?: number; // Calculated on client
  latitude?: number;
  longitude?: number;
  freeDelivery?: boolean;
  freeDeliveryRadius?: number;
  maxDeliveryDistance?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  supplierId: string; // Grouping orders by supplier might be needed, but simple for now
  items: CartItem[];
  total: number;
  status: 'Aguardando aceitação' | 'Pedido aceito' | 'Em rota de entrega' | 'Entregue' | 'Cancelado';
  date: string; // created_at
  customerAddress: string;
  address?: Address; // Added for structured address access
  customerName?: string;
  distance?: number;
  paymentMethod?: string; // Added for payment method display
}

export interface ChatMessage {
  id: string;
  orderId: string;
  text: string;
  senderId: string;
  senderRole: 'client' | 'supplier' | 'support';
  timestamp: string; // ISO
  read: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  slug?: string;
}
