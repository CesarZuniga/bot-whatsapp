import { addKeyword, EVENTS } from '@builderbot/bot';
import { CitaAgent } from '../agents/cita.agent.js';
import { GeminiService } from '../services/gemini.service.js';
import { CalendarService } from '../services/calendar.service.js';

export const citasFlow = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic, state }) => {
        const { body, from, name } = ctx;
        
        try {
            // Inicializar servicios
            const geminiService = new GeminiService(process.env.GEMINI_API_KEY!);
            const calendarService = new CalendarService(
                process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
                process.env.GOOGLE_PRIVATE_KEY!,
                process.env.GOOGLE_CALENDAR_ID!
            );
            
            const citaAgent = new CitaAgent(geminiService, calendarService);
            
            // Procesar mensaje
            const respuesta = await citaAgent.procesarMensaje(body, from, name || 'Cliente');
            
            // Enviar respuesta
            await flowDynamic(respuesta);
            
        } catch (error) {
            console.error('Error en el flow de citas:', error);
            await flowDynamic('❌ Ocurrió un error procesando tu solicitud. Por favor intenta más tarde.');
        }
    });