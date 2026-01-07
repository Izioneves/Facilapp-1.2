
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useStore } from '../../../contexts/StoreContext';
import { User } from '../../../types';

import { authService } from '../../../services/api';

const ProfileEditScreen = () => {
    const navigate = useNavigate();
    const { user, setUser } = useStore();
    const { updateProfile } = authService; // Use the service that updates both

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        cpf: user?.cpf || '',
    });

    const [newAvatar, setNewAvatar] = useState<string | null>(null);

    const handleUpdateAvatar = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        setNewAvatar(reader.result);
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleSave = async () => {
        if (user) {
            // Update Supabase (Both Auth and Profile Table via service)
            const updates = {
                name: formData.name,
                phone: formData.phone,
                // Add any other fields if needed
            };

            const { error } = await updateProfile(user.id, updates);

            if (error) {
                console.error("Error updating profile:", error);
                alert("Erro ao salvar perfil.");
                return;
            }

            // Update Local State
            const updatedUser: User = {
                ...user,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                avatar: newAvatar || user.avatar
            };
            setUser(updatedUser);
            alert("Dados atualizados com sucesso!");
            navigate(-1);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><span className="material-symbols-outlined">arrow_back_ios_new</span></button>
                <h1 className="text-lg font-bold">Editar Perfil</h1>
                <div className="w-6"></div>
            </header>
            <main className="p-4 space-y-5">
                <div className="flex justify-center py-4">
                    <div className="relative cursor-pointer group" onClick={handleUpdateAvatar}>
                        {user?.avatar || newAvatar ? (
                            <img src={newAvatar || user?.avatar} className="size-24 rounded-full border-4 border-white shadow-md object-cover" />
                        ) : (
                            <div className="size-24 rounded-full border-4 border-white shadow-md bg-slate-200 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-5xl">person</span>
                            </div>
                        )}
                        <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white shadow-sm hover:bg-primary-dark transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold ml-1 text-slate-700 dark:text-slate-300">Nome Completo</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold ml-1 text-slate-700 dark:text-slate-300">E-mail</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 outline-none transition-all cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold ml-1 text-slate-700 dark:text-slate-300">Telefone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold ml-1 text-slate-700 dark:text-slate-300">CPF</label>
                        <input
                            type="text"
                            value={formData.cpf}
                            disabled
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 outline-none transition-all"
                        />
                    </div>
                    {/* Address Removed from Profile Edit */}
                </div>
            </main>

            <div className="fixed bottom-0 w-full p-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 max-w-md mx-auto z-20">
                <button
                    onClick={handleSave}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-14 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">save</span>
                    Salvar Alterações
                </button>
            </div>
        </div>
    );
};
export default ProfileEditScreen;
