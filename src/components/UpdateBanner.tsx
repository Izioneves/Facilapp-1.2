import React, { useState } from 'react';

interface UpdateBannerProps {
    message?: string;
    storeUrl?: string;
    onDismiss: () => void;
}

const UpdateBanner: React.FC<UpdateBannerProps> = ({ message, storeUrl, onDismiss }) => {
    return (
        <div className="bg-blue-600 text-white p-4 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">info</span>
                <p className="text-sm font-medium">
                    {message || "Nova versão disponível!"}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {storeUrl && (
                    <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
                    >
                        ATUALIZAR
                    </a>
                )}
                <button onClick={onDismiss} className="p-1 hover:bg-blue-700 rounded-full">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>
        </div>
    );
};

export default UpdateBanner;
