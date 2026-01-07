
import { Product, Order, UserRole } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Detergente Líquido Limpol Neutro 500ml',
    brand: 'Limpol',
    price: 2.49,
    originalPrice: 2.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWvEIESzzGVniepo-k6Tyfg8FMkYTtI2y7gIBX_RdRTifq1gkVXbeBvXX5olzTQEDBF4KT9w6ljRjE-Y2g13pslIeliSTH6G_rc-dPa3WUWaut2COHS8SQUHRFBoxsZVJ_NLAGTt-PzojjZ9P1DuI_-8-69qmgkmif6FO6Ir4NEPnkjNE2sbsfGco9jtYZcxkLVq8FDfeM0009Tts6kyjD6Yg6O19utp1suT1li9-12xFa7MECbkluHD7TmDZUNyjyjGuxruMhoA',
    category: 'Limpeza',
    description: 'O Detergente Líquido Limpol é eficiente na remoção de gorduras e sujeiras, além de ter alto poder de espuma.',
    supplierId: 'sup1',
    rating: 4.9,
    reviews: 1200,
    unit: 'un',
    active: true,
    isOffer: true
  },
  {
    id: '2',
    name: 'Desinfetante Pinho Sol Original 1L',
    brand: 'Pinho Sol',
    price: 12.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrQS5xigGMPhxmcizXJF7wp5iuZaaZa3RIYKZG89o5n3M3zHmkLfe3EXVaH6XwoqRwqh_xlINylB9Gq4HmbNnbpnQSQpEm49L5oSL8pQYgPQuVEWZZtkmHXS6b5w49vlgwySRUknDq5AvcjJKTGWrsRAojRyDII9MfdsdWRQkP6yMQO5L48E5ZByBKox4iC7MM0TxtAzrsRjN-ee1_3oDrikAqrofFzlqp0xt68Zb3vQ1WIy-1LKxG4WyR6COkOeothj_vLorQww',
    category: 'Limpeza',
    description: 'Elimina 99,9% das bactérias, germes e fungos. Mantém sua casa limpa e protegida.',
    supplierId: 'sup1',
    rating: 4.8,
    unit: 'un',
    active: true
  },
  {
    id: '3',
    name: 'Saco de Lixo 100L Reforçado',
    brand: 'Dover',
    price: 22.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPVtvzc2T953ckAlCQDhsGEY1gPiNjOvQKp1-WVFhWHhS4UUBLvlBqvuuF8kkTtIO8sun0tgIsXED_i6X7jBxzMx5amD_DsrWqCuMPK_2KD5msTMyQK0_iD_fI3MUqSHANwxwYTwHHQrbSwXg3yVDtAloQ9JrjxV_tqVX9Np43WLu9rmWMft8xySEuiLu7eag4OYtq2hDEG-L282QLF330jT_UshFIJB7MUoM_sWa9f_U_7BSjJiIn8a82Zfa6JIX4ILzOH8EOfA',
    category: 'Embalagens',
    description: 'Alta resistência e qualidade superior. Ideal para condomínios e empresas.',
    supplierId: 'sup1',
    rating: 4.7,
    unit: 'Pacote 50un',
    active: true
  },
  {
    id: '4',
    name: 'Papel Toalha Interfolha 2 Dobras',
    brand: 'Melhoramentos',
    price: 32.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTYJxFlbkFwwHB-HebCUH2RYgYfYcFYWZL-dTl31R6AM8YOHVb_ukK9iTQ2ysVeyFZDKshM5AE1q2Et7RK05eop3E0nA0l-XactJ62PBPDjZ5PVP8kKz5PwgLfg9TnQeibpRAgJYYhLrdJXYPuAcRuzTkzxcVBHeM9mI-kcFnQGKuaC32mU7ZzVYiT6ElWWT6u4VSSYPjhXVDVy5RCQziFVfqVzIuLZH-4uSgn5RhIe1l_K4CTbRJuFkvboQnzQOTD4d5rEQBNGw',
    category: 'Higiene',
    description: 'Papel toalha interfolha branco, 100% celulose virgem.',
    supplierId: 'sup2',
    rating: 4.5,
    unit: 'Caixa 1000fls',
    active: true
  },
  {
    id: '5',
    name: 'Esponja Multiuso Leve 4 Pague 3',
    brand: 'Scotch-Brite',
    price: 6.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwMH0mhw3_zdZoB3u-yyXdc-IpVCwo3DnwZs0_unSjhS2S904edhkeItQ6Ik4iJ_xOGMJgqbAfm7yG_GOFANiMj6Rrt-ed6sfNE7UWXmK5kz1Qk253jVKICiyt2WKVvFI_TrcnkmZvHNHzC0rQjnGJgyec-D8Eu2wrAdQmlZ-0jHzBJBvREZvz-2-1G0h0_3bR7hRz0VyEt1Yqgnou7SvXb5WJ_qOhYmzEtxbraaA4oxDLigDLrEKRHDGoaxQCgGa_Rc81KK9wZg',
    category: 'Limpeza',
    description: 'Durabilidade e eficiência na limpeza diária.',
    supplierId: 'sup1',
    rating: 4.8,
    unit: 'Pack',
    active: true
  },
  {
    id: '6',
    name: 'Copo Descartável 200ml',
    brand: 'Strawplast',
    price: 3.50,
    originalPrice: 3.90,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT-DOxLQNMv_qIj40xCnE3ba6GurbC4TD87M9XD0jG0cUAGFhqku9-Le9pgs63i2AF-5XoJmTNqae1xX_dGtzxQBeL9BrYqHGxeSQXu829yX58xQJv2KwJgsZ73B0q_iuhl4FCYwlMneOs8yBMCPXSb5mjANMfNI9AMh8cYLGkmNCN1Ewd5Oxsg0IVjRjKg-3DDeETbc-f3zlzLDiGOXJfYfB99Zt9J8ilCw8nLmiVi5icgUb5tUkKBIN2npxVBN-Kih_GGOxLbw',
    category: 'Descartáveis',
    description: 'Resistente e prático para o dia a dia.',
    supplierId: 'sup2',
    rating: 4.2,
    unit: '100un',
    active: true,
    isOffer: true
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: '48291',
    date: '2023-10-25T14:30:00',
    status: 'Pendente',
    total: 68.40,
    customerName: 'Mariana Costa',
    customerAddress: 'Rua das Flores, 123 - Centro',
    items: [
      { ...MOCK_PRODUCTS[0], quantity: 2 },
      { ...MOCK_PRODUCTS[2], quantity: 1 }
    ]
  },
  {
    id: '48288',
    date: '2023-10-25T11:15:00',
    status: 'Em Preparação',
    total: 120.00,
    customerName: 'Restaurante Sabor Bom',
    customerAddress: 'Av. Principal, 500 - Loja 2',
    items: [
        { ...MOCK_PRODUCTS[1], quantity: 5 },
        { ...MOCK_PRODUCTS[4], quantity: 10 }
    ]
  },
  {
    id: '48102',
    date: '2023-10-24T09:20:00',
    status: 'Concluído',
    total: 158.90,
    customerName: 'Mercado Silva',
    customerAddress: 'Rua da Praia, 88',
    items: [
        { ...MOCK_PRODUCTS[3], quantity: 5 }
    ]
  }
];
