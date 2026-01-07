import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.facil.app',
    appName: 'Facil App',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
