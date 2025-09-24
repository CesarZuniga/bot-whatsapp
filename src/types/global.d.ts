export interface Cita {
    id?: string;
    cliente: string;
    telefono: string;
    servicio: string;
    fecha: string;
    hora: string;
    estado: 'pendiente' | 'confirmada' | 'cancelada';
    eventoCalendarId?: string;
}

export interface AnalisisGemini {
    intencion: 'agendar' | 'consultar' | 'cancelar' | 'otro';
    servicio?: string;
    fecha?: string;
    hora?: string;
    confianza: number;
    mensajeError?: string;
}

export interface Disponibilidad {
    disponible: boolean;
    mensaje: string;
    horariosDisponibles?: string[];
}

export interface Servicio {
    nombre: string;
    duracion: number;
    descripcion: string;
}