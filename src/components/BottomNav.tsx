import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useStore } from '../contexts/StoreContext';

interface BottomNavProps {
  role: UserRole;
}

interface NavLinkItem {
  icon: string;
  label: string;
  path: string;
  badge?: number;
  special?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, orders } = useStore();

  const isActive = (path: string) => location.pathname === path;

  const clientLinks: NavLinkItem[] = [
    { icon: 'home', label: 'Início', path: '/home' },
    { icon: 'search', label: 'Busca', path: '/search' },
    { icon: 'shopping_cart', label: 'Cesta', path: '/cart', badge: cart.length },
    { icon: 'receipt_long', label: 'Pedidos', path: '/orders' },
    { icon: 'person', label: 'Perfil', path: '/profile' },
  ];

  const supplierLinks: NavLinkItem[] = [
    { icon: 'storefront', label: 'Início', path: '/supplier/dashboard' },
    { icon: 'inventory_2', label: 'Produtos', path: '/supplier/products' },
    { icon: 'add_circle', label: 'Adicionar', path: '/supplier/add-product', special: true }, // Special center button
    { icon: 'receipt_long', label: 'Pedidos', path: '/supplier/orders', badge: orders.filter(o => o.status === 'Pendente').length },
    { icon: 'person', label: 'Perfil', path: '/supplier/profile' },
  ];

  const links = (role === UserRole.CLIENT || role === 'client') ? clientLinks : supplierLinks;

  return (
    <nav className="w-full bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 pb-safe h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pointer-events-auto">
      <div className="flex justify-around items-center h-full px-2">
        {links.map((link) => {
          const active = isActive(link.path);

          if (link.special) {
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="-mt-8 bg-primary text-white rounded-full p-3.5 shadow-lg shadow-primary/30 hover:scale-105 transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[28px]">{link.icon}</span>
              </button>
            )
          }

          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${active ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              <div className="relative">
                <span className={`material-symbols-outlined text-[24px] ${active ? 'filled' : ''}`}>
                  {link.icon}
                </span>
                {link.badge ? (
                  <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-surface-dark">
                    {link.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{link.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
