import 'dotenv/config';
import { createBotInstance } from './app';
const PORT = process.env.PORT ?? 3008;
const main = async () => {
    try {
        console.log('🚀 Iniciando Bot de Citas WhatsApp...');
        console.log('📋 Verificando configuración...');
        
        // Verificar variables de entorno requeridas
        const requiredEnvVars = [
            'GEMINI_API_KEY',
            'GOOGLE_CALENDAR_ID',
            'GOOGLE_SERVICE_ACCOUNT_EMAIL',
            'GOOGLE_PRIVATE_KEY'
        ];
        
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`Falta la variable de entorno: ${envVar}`);
            }
        }
        
        console.log('✅ Configuración verificada correctamente');
        
        const bot = await createBotInstance();
        bot.httpServer(+PORT)
        console.log('✅ Bot iniciado correctamente');
        console.log('📱 Escanea el código QR con WhatsApp');
        console.log('💡 Envía "hola" al bot para comenzar');
        
    } catch (error) {
        console.error('❌ Error al iniciar el bot:', error);
        process.exit(1);
    }
};

main();