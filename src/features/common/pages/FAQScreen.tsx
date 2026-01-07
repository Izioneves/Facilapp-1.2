import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { supabase } from '../../../lib/supabaseClient';

const FAQScreen = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFaqs();
    }, []);

    const loadFaqs = async () => {
        // Fetch FAQs targeting 'both' OR the specific user role
        const role = user?.type || 'client';
        const { data } = await supabase
            .from('faqs')
            .select('*')
            .in('role_target', ['both', role]);

        if (data) setFaqs(data);
        setLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <header className="bg-white dark:bg-surface-dark p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">Ajuda e FAQ</h1>
            </header>

            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Carregando perguntas...</div>
                ) : (
                    faqs.map(faq => (
                        <div key={faq.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-sm mt-1">help</span>
                                {faq.question}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm pl-6">{faq.answer}</p>
                        </div>
                    ))
                )}

                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800 flex items-center gap-4 mt-8">
                    <div className="bg-green-500 text-white p-3 rounded-full">
                        <span className="material-symbols-outlined">chat</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-green-800 dark:text-green-400">Ainda tem dúvidas?</h4>
                        <p className="text-sm text-green-700 dark:text-green-500 mb-2">Fale com nosso suporte no WhatsApp.</p>
                        <button
                            onClick={() => window.open('https://wa.me/554198070056', '_blank')}
                            className="text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Abrir Conversa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQScreen;
