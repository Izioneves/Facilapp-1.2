
import { User, Product, Order, Address, Store } from '../types';

export const mapUser = (backendUser: any): User => {
    // Supabase Auth User Structure check
    if (backendUser.user_metadata) {
        const meta = backendUser.user_metadata;
        // Prioritize metadata role, fallback to app_metadata or 'client'
        const role = meta.role || backendUser.app_metadata?.role || (meta.type === 'supplier' ? 'supplier' : 'client');
        const isClient = role === 'client' || role === 'CLIENT';

        return {
            id: backendUser.id,
            type: isClient ? 'client' : 'supplier',
            name: meta.name || meta.full_name || meta.companyName || 'Usuário Sem Nome',
            email: backendUser.email || '',
            phone: meta.phone,
            cpf: meta.cpf,
            cnpj: meta.cnpj,
            companyName: meta.companyName,
            responsibleName: meta.responsibleName,
            categories: meta.categories || [],
            address: meta.address ? {
                street: meta.address.street || '',
                number: meta.address.number || '',
                neighborhood: meta.address.neighborhood || '',
                city: meta.address.city || '',
                state: meta.address.state || '',
                zipCode: meta.address.zipCode || meta.address.zip || ''
            } : undefined
        };
    }

    // Fallback for Legacy Backend (if ever needed, but likely generic safe-guard)
    const isClient = backendUser.role === 'CLIENT';
    const profile = isClient ? backendUser.clientProfile : backendUser.supplierProfile;
    const address = backendUser.addresses?.[0] || {};

    return {
        id: backendUser.id,
        type: isClient ? 'client' : 'supplier',
        name: isClient ? profile?.full_name : profile?.company_name,
        email: backendUser.email,
        phone: profile?.phone,
        cpf: isClient ? profile?.cpf : undefined,
        cnpj: !isClient ? profile?.cnpj : undefined,
        companyName: !isClient ? profile?.company_name : undefined,
        responsibleName: !isClient ? profile?.responsible_name : undefined,
        categories: !isClient && profile?.categories ? JSON.parse(profile.categories) : [],
        address: {
            street: address.street || '',
            number: address.number || '',
            neighborhood: address.neighborhood || '',
            city: address.city || '',
            state: address.state || '',
            zipCode: address.zip_code || ''
        }
    };
};

export const mapProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price) || 0,
    originalPrice: p.promotional_price ? Number(p.promotional_price) : undefined,
    image: p.image || p.images?.[0]?.url || '',
    category: p.category || 'Geral',
    supplierId: p.supplier_id,
    storeId: p.store_id || p.store?.id,
    supplierName: p.store?.name || p.supplierName || p.supplier?.company_name || 'Loja Parceira', // Prioritize Store Name
    unit: p.unit,
    minOrder: p.min_order_quantity,
    active: p.active ?? p.is_active,
    // stock: p.stock_quantity // Frontend interface doesn't have stock yet, user asked to validate it in backend. I should add it to interface if needed, but strict rules say "No frontend changes" (visual). Adding field to interface is fine.
});

export const mapOrder = (o: any): Order => ({
    id: o.id,
    userId: o.client_id,
    supplierId: o.supplier_id,
    items: (o.items || []).map((i: any) => ({
        ...mapProduct(i.product || {}),
        quantity: i.quantity || 0
    })),
    total: Number(o.total_amount || 0),
    status: mapStatus(o.status),
    date: o.created_at,
    customerAddress: (typeof o.delivery_address === 'string' ? JSON.parse(o.delivery_address) : o.delivery_address)?.street ||
        (typeof o.delivery_address_snapshot === 'string' ? JSON.parse(o.delivery_address_snapshot) : o.delivery_address_snapshot)?.street ||
        'Endereço não disponível',
    address: typeof o.delivery_address === 'string' ? JSON.parse(o.delivery_address) : o.delivery_address,
    paymentMethod: o.payment_method,
    customerName: o.client?.name || o.client?.companyName || 'Cliente',
    distance: (typeof o.delivery_address === 'string' ? JSON.parse(o.delivery_address) : o.delivery_address)?.distance || undefined
});

const mapStatus = (s: string): any => {
    const map: any = {
        'PENDING': 'Aguardando aceitação',
        'ACCEPTED': 'Pedido aceito',
        'PREPARING': 'Em preparação', // Mismatch in types? Frontend says "Em rota de entrega"
        'SHIPPING': 'Em rota de entrega',
        'DELIVERED': 'Entregue',
        'CANCELED': 'Cancelado'
    };
    return map[s] || s;
}

export const mapStore = (s: any): any => ({
    id: s.id,
    supplierId: s.supplier_id,
    name: s.name,
    description: s.description,
    image: s.image || s.image_url || '',
    image_url: s.image || s.image_url || '', // Fix for HomeScreen compatibility
    address: s.address || ((s.address_json && typeof s.address_json === 'object') ? `${s.address_json.street || ''}, ${s.address_json.number || ''}` : s.address_json) || '',
    phone: s.phone,
    active: s.active,
    minOrder: Number(s.min_order || s.minimum_order_value || 0),
    deliveryTime: s.delivery_time_estimate,
    deliveryPrice: Number(s.delivery_price || s.delivery_price_per_km || 0),
    freeDelivery: s.free_delivery_enabled || s.free_delivery,
    freeDeliveryRadius: Number(s.free_delivery_radius_km || s.free_delivery_radius || 0),
    maxDeliveryDistance: Number(s.max_delivery_distance_km || s.max_delivery_distance || 10),
    pixDiscount: Number(s.pix_discount || s.pix_discount_percentage || 0),
    cashDiscount: Number(s.cash_discount || s.cash_discount_percentage || 0),
    enableBoleto: s.enable_boleto,
    latitude: s.latitude,
    longitude: s.longitude,
    addressDetails: s.address_json || {}
});
