import { google, calendar_v3 } from 'googleapis';
import { Disponibilidad } from '../types/global.js';

export class CalendarService {
    private calendar: calendar_v3.Calendar;
    private calendarId: string;

    constructor(serviceAccountEmail: string, privateKey: string, calendarId: string) {
        const auth = new google.auth.JWT({
            email: serviceAccountEmail,
            key: privateKey.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/calendar']
        });

        this.calendar = google.calendar({ version: 'v3', auth });
        this.calendarId = calendarId;
    }

    async verificarDisponibilidad(fecha: string, hora: string, duracionMinutos: number = 30): Promise<Disponibilidad> {
        try {
            const startTime = new Date(`${fecha}T${hora}:00`);
            const endTime = new Date(startTime.getTime() + duracionMinutos * 60000);

            const response = await this.calendar.events.list({
                calendarId: this.calendarId,
                timeMin: startTime.toISOString(),
                timeMax: endTime.toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            });

            const eventosExistentes = response.data.items || [];

            if (eventosExistentes.length > 0) {
                const horariosDisponibles = await this.obtenerHorariosDisponibles(fecha);
                return {
                    disponible: false,
                    mensaje: `❌ Lo siento, el horario ${hora} del ${fecha} no está disponible.`,
                    horariosDisponibles
                };
            }

            return {
                disponible: true,
                mensaje: `✅ Horario disponible confirmado para ${fecha} a las ${hora}`
            };

        } catch (error) {
            console.error('Error verificando disponibilidad:', error);
            return {
                disponible: false,
                mensaje: '❌ Error al verificar disponibilidad. Intenta más tarde.'
            };
        }
    }

    async crearEventoCita(cliente: string, telefono: string, servicio: string, fecha: string, hora: string): Promise<string> {
        try {
            const startTime = new Date(`${fecha}T${hora}:00`);
            const duracion = this.obtenerDuracionServicio(servicio);
            const endTime = new Date(startTime.getTime() + duracion * 60000);

            const event = {
                summary: `Cita: ${servicio} - ${cliente}`,
                description: `Cliente: ${cliente}\nTeléfono: ${telefono}\nServicio: ${servicio}`,
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: 'America/Mexico_City',
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: 'America/Mexico_City',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 60 },
                        { method: 'popup', minutes: 30 }
                    ]
                }
            };

            const response = await this.calendar.events.insert({
                calendarId: this.calendarId,
                requestBody: event
            });

            return response.data.id || '';

        } catch (error) {
            console.error('Error creando evento:', error);
            throw new Error('No se pudo crear la cita en el calendario');
        }
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

    private async obtenerHorariosDisponibles(fecha: string): Promise<string[]> {
        const horarios = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        const horariosDisponibles: string[] = [];

        for (const hora of horarios) {
            const disponibilidad = await this.verificarDisponibilidad(fecha, hora, 30);
            if (disponibilidad.disponible) {
                horariosDisponibles.push(hora);
            }
        }

        return horariosDisponibles;
    }
}