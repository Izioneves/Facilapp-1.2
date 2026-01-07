/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#3b82f6', // blue-500
                'primary-dark': '#2563eb', // blue-600
                secondary: '#64748b', // slate-500
                background: {
                    light: '#f8fafc', // slate-50
                    dark: '#0f172a', // slate-900
                },
                surface: {
                    light: '#ffffff',
                    dark: '#1e293b', // slate-800
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
