import { CalendarService } from '~/services/calendar.service';
import { GeminiService } from '~/services/gemini.service';
import { AnalisisGemini } from '~/types/global';

export class CitaAgent {
    constructor(
        private readonly geminiService: GeminiService,
        private readonly calendarService: CalendarService
    ) {}

    async procesarMensaje(mensaje: string, telefono: string, nombre: string): Promise<string> {
        const analisis = await this.geminiService.analizarMensaje(mensaje);

        if (analisis.mensajeError) {
            return analisis.mensajeError;
        }

        switch (analisis.intencion) {
            case 'agendar':
                return await this.procesarAgendarCita(analisis, telefono, nombre);
            
            case 'consultar':
                return await this.procesarConsulta(analisis);
            
            case 'cancelar':
                return '📅 Para cancelar una cita, por favor proporciona tu número de teléfono y la fecha de tu cita.';
            
            default:
                return this.obtenerMensajeDefault();
        }
    }

    private async procesarAgendarCita(analisis: AnalisisGemini, telefono: string, nombre: string): Promise<string> {
        if (!analisis.servicio || !analisis.fecha || !analisis.hora) {
            return this.solicitarInformacionFaltante(analisis);
        }

        const disponibilidad = await this.calendarService.verificarDisponibilidad(
            analisis.fecha, 
            analisis.hora,
            this.obtenerDuracionServicio(analisis.servicio)
        );

        if (!disponibilidad.disponible) {
            let mensaje = disponibilidad.mensaje;
            if (disponibilidad.horariosDisponibles && disponibilidad.horariosDisponibles.length > 0) {
                mensaje += `\n\n🕐 Horarios disponibles para ${analisis.fecha}:\n`;
                mensaje += disponibilidad.horariosDisponibles.map(h => `• ${h}`).join('\n');
            }
            return mensaje;
        }

        try {
            const eventoId = await this.calendarService.crearEventoCita(
                nombre,
                telefono,
                analisis.servicio,
                analisis.fecha,
                analisis.hora
            );

            return `✅ *CITA CONFIRMADA*\n\n📅 Fecha: ${this.formatearFecha(analisis.fecha)}\n🕐 Hora: ${analisis.hora}\n💇 Servicio: ${analisis.servicio}\n👤 Cliente: ${nombre}\n\n📍 Por favor llega 5 minutos antes. ¡Te esperamos!`;
        
        } catch (error) {
            return '❌ Ocurrió un error al agendar tu cita. Por favor intenta más tarde.';
        }
    }

    private solicitarInformacionFaltante(analisis: AnalisisGemini): string {
        const faltantes: string[] = [];
        
        if (!analisis.servicio) faltantes.push('servicio');
        if (!analisis.fecha) faltantes.push('fecha');
        if (!analisis.hora) faltantes.push('hora');

        return `📝 Para agendar tu cita necesito:\n\n${faltantes.map(f => `• ${f}`).join('\n')}\n\nPor favor proporciona esta información.`;
    }

    private obtenerDuracionServicio(servicio: string): number {
        const duraciones: { [key: string]: number } = {
            'corte de cabello': 30,
            'manicure': 45,
            'masaje': 60,
            'coloración': 90
        };
        return duraciones[servicio.toLowerCase()] || 30;
    }

    private formatearFecha(fecha: string): string {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', options);
    }

    private async procesarConsulta(analisis: AnalisisGemini): Promise<string> {
        return `ℹ️ *INFORMACIÓN DE SERVICIOS*\n\n💇 Servicios disponibles:\n• Corte de Cabello (30 min)\n• Manicure/Pedicure (45 min)\n• Masaje Relajante (60 min)\n• Coloración Capilar (90 min)\n\n🕐 Horarios:\nLunes-Viernes: 9:00 AM - 6:00 PM\nSábados: 9:00 AM - 2:00 PM\n\n💬 Para agendar: "Quiero una cita para corte de cabello el viernes a las 10:00"`;
    }

    private obtenerMensajeDefault(): string {
        return `👋 ¡Hola! Soy tu asistente virtual para agendar citas.\n\nPuedo ayudarte con:\n• 📅 Agendar nuevas citas\n• ℹ️ Consultar servicios y horarios\n• ❌ Cancelar citas existentes\n\n💬 Ejemplo: "Quiero agendar un masaje para el próximo lunes a las 3pm"`;
    }
}