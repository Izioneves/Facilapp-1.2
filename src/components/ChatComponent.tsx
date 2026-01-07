import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import { ChatMessage } from '../types';

interface ChatComponentProps {
    orderId: string;
}

const ChatComponent = ({ orderId }: ChatComponentProps) => {
    const { messages, sendMessage, user } = useStore();
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const orderMessages = messages.filter(m => m.orderId === orderId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [orderMessages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendMessage(orderId, inputText);
        setInputText('');
    };

    return (
        <div className="flex flex-col h-[400px] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-white dark:bg-surface-dark p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-sm">Chat do Pedido</h3>
                <span className="text-xs text-slate-500 text-green-600 flex items-center gap-1">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse"></span> Online
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {orderMessages.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-10">
                        Nenhuma mensagem ainda.
                    </div>
                ) : (
                    orderMessages.map(msg => {
                        const isMe = msg.senderId === user?.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none'}`}>
                                    <p>{msg.text}</p>
                                    <span className={`text-[10px] block mt-1 ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-700 flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
                <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="size-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">send</span>
                </button>
            </div>
        </div>
    );
};

export default ChatComponent;
