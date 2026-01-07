
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoUser() {
    const email = 'demo@facil.com';
    const password = 'demo123'; // Min 6 chars

    console.log(`Creating demo user: ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: 'demo', // The Magic Role
                name: 'Usuário Demo',
                phone: '11 99999-9999',
                address: {
                    street: 'Rua Demo',
                    number: '123',
                    neighborhood: 'Centro',
                    city: 'São Paulo',
                    state: 'SP',
                    zipCode: '00000-000'
                },
                categories: ['Demo Category'],
                companyName: 'Demo Company Ltda',
                responsibleName: 'Demo Admin',
                cnpj: '00.000.000/0001-00',
                cpf: '000.000.000-00'
            }
        }
    });

    if (error) {
        console.error('Error creating demo user:', error.message);
    } else {
        console.log('Demo User Created Successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role:', 'demo (Access to Client & Supplier)');
    }
}

createDemoUser();
