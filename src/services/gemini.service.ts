import { GoogleGenAI } from '@google/genai';
import { AnalisisGemini } from '../types/global.js';

export class GeminiService {
    private genAI: GoogleGenAI;
    private contexto: string;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenAI({apiKey});

        this.contexto = `
Eres un asistente especializado en agendar citas para una empresa de servicios. 

SERVICIOS DISPONIBLES:
- Corte de Cabello (30 minutos)
- Manicure y Pedicure (45 minutos) 
- Masaje Relajante (60 minutos)
- Coloración Capilar (90 minutos)

HORARIOS DISPONIBLES:
- Lunes a Viernes: 9:00 AM - 6:00 PM
- Sábados: 9:00 AM - 2:00 PM
- Domingos: Cerrado

INSTRUCCIONES:
1. Analiza el mensaje del usuario y identifica la intención (agendar, consultar, cancelar)
2. Extrae: servicio, fecha y hora preferida
3. Si falta información, pide amablemente los datos necesarios
4. Las fechas deben estar en formato YYYY-MM-DD
5. Las horas en formato HH:MM (24 horas)

Responde siempre en JSON válido con esta estructura:
{
    "intencion": "agendar|consultar|cancelar|otro",
    "servicio": "nombre del servicio",
    "fecha": "YYYY-MM-DD",
    "hora": "HH:MM",
    "confianza": 0.95,
    "mensajeError": "si hay error"
}
`;
    }

    async analizarMensaje(mensaje: string): Promise<AnalisisGemini> {
        try {
            const prompt = `${this.contexto}\n\nMENSAJE DEL CLIENTE: "${mensaje}"\n\nANÁLISIS:`;
            const response = await this.genAI.models.generateContent({ model: 'gemini-2.0-flash-001', contents: prompt});
            const text = response.text;
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No se pudo extraer JSON de la respuesta');
            }
            
            const analisis: AnalisisGemini = JSON.parse(jsonMatch[0]);
            return analisis;
            
        } catch (error) {
            console.error('Error en GeminiService:', error);
            return {
                intencion: 'otro',
                confianza: 0,
                mensajeError: 'No pude entender tu mensaje. ¿Podrías intentarlo de nuevo?'
            };
        }
    }
}