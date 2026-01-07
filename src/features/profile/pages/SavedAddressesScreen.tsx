import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import BottomNav from '../../../components/BottomNav';

const SavedAddressesScreen = () => {
  const navigate = useNavigate();
  const { user } = useStore();

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <header className="bg-white dark:bg-surface-dark p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="text-lg font-bold">Meus Endereços</h1>
      </header>
      <div className="p-4 space-y-4">
        {user?.address && user.address.street && (
          <div className="p-4 bg-white dark:bg-surface-dark rounded-xl border-l-4 border-primary shadow-sm flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-[18px]">home</span>
                <h3 className="font-bold text-slate-900 dark:text-white">Principal</h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Padrão</span>
              </div>
              <p className="text-sm text-slate-500">{user.address.street}, {user.address.number}</p>
              <p className="text-xs text-slate-400">{user.address.neighborhood} - {user.address.city}/{user.address.state}</p>
              <p className="text-xs text-slate-400">{user.address.zipCode}</p>
            </div>
            <button onClick={() => navigate('/addresses/edit', { state: { address: user.address } })} className="text-primary"><span className="material-symbols-outlined">edit</span></button>
          </div>
        )}

        <button
          onClick={() => navigate('/addresses/new', { state: { address: {} } })}
          className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Adicionar novo endereço
        </button>
      </div>
    </div>
  );
};
export default SavedAddressesScreen;
