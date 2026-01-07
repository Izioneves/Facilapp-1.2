import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useStore } from '../../../contexts/StoreContext';
import BottomNav from '../../../components/BottomNav';

const SettingsScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <header className="bg-white dark:bg-surface-dark p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)}><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="text-lg font-bold">Configurações</h1>
      </header>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-xl">
          <span>Notificações Push</span>
          <div className="w-10 h-6 bg-primary rounded-full relative"><div className="absolute right-1 top-1 size-4 bg-white rounded-full"></div></div>
        </div>
      </div>
    </div>
  );
};
export default SettingsScreen;
