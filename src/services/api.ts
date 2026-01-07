import { supabase } from '../lib/supabaseClient';
import axios from 'axios';

// --- Auth Service ---
export const authService = {
    login: async (email: string, password: string, type: 'client' | 'supplier') => {
        // 1. Auth with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { data: null, error };

        // 2. Fetch extra profile data from 'profiles' table if needed
        // For now, we rely on the metadata or subsequent context loading
        return { data, error: null };
    },

    register: async (email: string, password: string, metadata: any) => {
        // 1. SignUp
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });

        if (error) return { data: null, error };

        // 2. Insert into 'profiles' table for robustness
        // We do this silently; if it fails, we still have metadata
        if (data.user) {
            const profileData = {
                id: data.user.id,
                email: email,
                name: metadata.name || metadata.companyName,
                role: metadata.role,
                phone: metadata.phone,
                cpf: metadata.cpf,
                cnpj: metadata.cnpj,
                address: metadata.address, // Ensure DB has JSONB or columns for this
                categories: metadata.categories,
                latitude: metadata.location?.lat,
                longitude: metadata.location?.lng
            };
            const { error: profileError } = await supabase.from('profiles').upsert(profileData);
            if (profileError) console.error("Failed to create profile record:", profileError);

            // 3. Auto-create Store for Supplier
            if (metadata.role === 'supplier' || metadata.role === 'SUPPLIER') {
                const { error: storeError } = await supabase.from('stores').insert({
                    supplier_id: data.user.id,
                    name: metadata.companyName || metadata.name || "Minha Loja",
                    address_json: metadata.address,
                    latitude: metadata.location?.lat,
                    longitude: metadata.location?.lng,
                    active: true
                });
                if (storeError) console.error("Failed to create default store:", storeError);
            }
        }

        return { data, error: null };
    },

    logout: async () => {
        return await supabase.auth.signOut();
    },

    // Helper to get full profile
    getProfile: async (userId: string) => {
        return await supabase.from('profiles').select('*').eq('id', userId).single();
    },

    updateProfile: async (userId: string, updates: any) => {
        // Update both metadata and table
        const { error: authError } = await supabase.auth.updateUser({ data: updates });
        const { error: dbError } = await supabase.from('profiles').update(updates).eq('id', userId);
        return { error: authError || dbError };
    }
};

// --- Product Service ---
// --- Product Service ---
export const productService = {
    list: async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*, store_id, supplier:profiles(name), store:stores(name, id)')
            // .eq('is_active', true) 
            .order('created_at', { ascending: false });

        if (error) return { data: [], error };
        if (!data) return { data: [], error: null };

        const mapped = data.map((p: any) => ({
            ...p,
            supplierName: p.store?.name || p.supplier?.name || "Loja"
        }));

        return { data: mapped, error: null };
    },

    create: async (productData: any) => {
        const supplierId = productData.supplierUserId;
        console.log(`[BACKEND FLOW] Creating Product for Supplier: ${supplierId}`);

        if (!supplierId) return { error: "ID do fornecedor inválido (Sessão perdida?)" };

        // 1. Resolve Store (Deterministic)
        let { data: store, error: fetchStoreError } = await supabase
            .from('stores')
            .select('id')
            .eq('supplier_id', supplierId)
            .single();

        if (fetchStoreError && fetchStoreError.code !== 'PGRST116') { // PGRST116 = Not found
            console.error("[BACKEND FLOW] Error fetching store:", fetchStoreError);
        }

        // 2. Auto-create Store if missing
        if (!store) {
            console.log("[BACKEND FLOW] Store not found. Attempting Auto-Creation...");

            // Fetch Profile Name for Store Name (Best Effort)
            const { data: profile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', supplierId)
                .single();

            const storeName = profile?.name || "Minha Loja";

            const { data: newStore, error: createStoreError } = await supabase
                .from('stores')
                .insert({
                    supplier_id: supplierId,
                    name: storeName,
                    active: true,
                    delivery_price: 0,
                    min_order: 0
                })
                .select('id')
                .single();

            if (createStoreError || !newStore) {
                console.error("[BACKEND FLOW] CRITICAL: Failed to create store.", createStoreError);
                return { error: `Erro ao criar loja: ${createStoreError?.message || 'Erro desconhecido'}` };
            }

            console.log(`[BACKEND FLOW] Store Created: ${newStore.id}`);
            store = newStore;
        } else {
            console.log(`[BACKEND FLOW] Using Existing Store: ${store.id}`);
        }

        // 3. Create Product (Guaranteed Linkage)
        const productPayload = {
            supplier_id: supplierId,
            store_id: store.id,
            name: productData.name,
            description: productData.description,
            price: parseFloat(productData.price),
            unit: productData.unit,
            image: productData.image,
            active: true,
            stock_quantity: productData.stock || 100
        };

        console.log("[BACKEND FLOW] Inserting Product:", productPayload);

        const { data, error } = await supabase
            .from('products')
            .insert([productPayload])
            .select()
            .single();

        if (error) {
            console.error("[BACKEND FLOW] Product Insert Failed:", error);
        }

        return { data, error };
    },

    update: async (id: string, updates: any) => {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    getById: async (id: string) => {
        return await supabase.from('products').select('*').eq('id', id).single();
    },

    healthCheck: async () => {
        const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
        return { ok: !error, error };
    }
};

// --- Order Service ---
export const orderService = {
    create: async (orderPayload: any) => {
        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                client_id: orderPayload.clientUserId,
                supplier_id: orderPayload.supplierId,
                total_amount: orderPayload.totalAmount || 0, // Respect calculated total
                status: 'PENDING',
                delivery_address: JSON.stringify(orderPayload.deliveryAddress), // Store snapshot
                payment_method: orderPayload.paymentMethodType
            }])
            .select()
            .single();

        if (orderError || !order) return { error: orderError };

        // 2. Create Order Items
        const items = orderPayload.items.map((i: any) => ({
            order_id: order.id,
            product_id: i.productId,
            quantity: i.quantity,
            // price: ?? We should ideally fetch current price to prevent tampering
            // For now assume backend trigger or simplified flow
            unit_price: i.price || 0 // Placeholder, DB trigger usually handles this
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(items);

        return { data: order, error: itemsError };
    },

    listClient: async (userId: string) => {
        return await supabase
            .from('orders')
            .select('*, items:order_items(product:products(name, image, unit), quantity)')
            .eq('client_id', userId)
            .order('created_at', { ascending: false });
    },

    listSupplier: async (userId: string) => {
        return await supabase
            .from('orders')
            .select('*, items:order_items(product:products(name, image, unit, price), quantity), client:profiles!orders_client_id_fkey(name, phone)') // Fetch client info
            .eq('supplier_id', userId)
            .order('created_at', { ascending: false });
    },

    updateStatus: async (orderId: string, status: string, userId: string) => {
        return await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId); // RLS will ensure only relevant supplier can update
    }
};

// --- CEP Service (ViaCEP) ---
export const cepService = {


    fetchAddress: async (cep: string) => {
        try {
            // 1. Get Address Details from ViaCEP (Official BR Source)
            const cleanCep = cep.replace(/\D/g, '');
            const viaCepRes = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);

            if (viaCepRes.data.erro) {
                return { error: 'CEP não encontrado' };
            }

            const { logradouro, bairro, localidade, uf } = viaCepRes.data;

            // 2. Get Coordinates from Nominatim using the full address
            const addressQuery = `${logradouro}, ${bairro}, ${localidade} - ${uf}, Brazil`;
            const geoRes = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: addressQuery,
                    format: 'json',
                    limit: 1
                },
                headers: {
                    'User-Agent': 'FacilApp/1.0'
                }
            });

            let lat = null;
            let lon = null;

            if (geoRes.data && geoRes.data.length > 0) {
                lat = parseFloat(geoRes.data[0].lat);
                lon = parseFloat(geoRes.data[0].lon);
            }

            return {
                street: logradouro,
                neighborhood: bairro,
                city: localidade,
                state: uf,
                lat,
                lon,
                error: null
            };
        } catch (e) {
            console.error("CEP/Geo Error", e);
            return { error: 'Erro ao buscar CEP' };
        }
    }
};
// --- Store Service ---
export const storeService = {
    // Get store by supplier ID
    getMyStore: async (supplierId: string) => {
        return await supabase.from('stores').select('*').eq('supplier_id', supplierId).single();
    },

    getById: async (storeId: string) => {
        return await supabase.from('stores').select('*').eq('id', storeId).single();
    },

    listNearby: async (lat: number, lng: number, radiusKm: number = 50) => {
        // Simple bounding box or just fetch all and filter in JS (easier for MVP with few stores)
        // For real app, use PostGIS. MVP: Client side sort.
        const { data, error } = await supabase.from('stores').select('*');
        return { data, error };
    },

    update: async (storeId: string, updates: any) => {
        const { data, error } = await supabase
            .from('stores')
            .update(updates)
            .eq('id', storeId)
            .select()
            .single();
        return { data, error };
    },

    uploadImage: async (file: File, storeId: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${storeId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('stores')
            .upload(filePath, file);

        if (uploadError) return { data: null, error: uploadError };

        const { data } = supabase.storage.from('stores').getPublicUrl(filePath);
        return { data: data.publicUrl, error: null };
    },

    calculateDelivery: async (storeId: string, lat: number, lng: number) => {
        const { data, error } = await supabase.rpc('calculate_delivery_info', {
            store_id_param: storeId,
            user_lat: lat,
            user_lng: lng
        });

        return { data, error };
    }
};

// --- Config Service ---
export const configService = {
    getAppConfig: async () => {
        const { data, error } = await supabase
            .from('app_config')
            .select('*')
            .single();
        return { data, error };
    }
};

export default { authService, productService, orderService, cepService, configService, storeService };
