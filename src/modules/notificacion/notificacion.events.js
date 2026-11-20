import { EventEmitter } from "node:events";

export const notificacionEventBus = new EventEmitter();

// Aumentar el límite de listeners para evitar advertencias de Node
notificacionEventBus.setMaxListeners(30);

export const NOTIFICACION_EVENTOS = {
    SOLICITUD_CREADA: "solicitud:creada",
    SERVICIO_ASIGNADO: "servicio:asignado",
    CONDUCTOR_EN_CAMINO: "conductor:en_camino",
    SERVICIO_COMPLETADO: "servicio:completado",
    SOLICITUD_CANCELADA: "solicitud:cancelada",
    NOVEDAD_REPORTADA: "novedad:reportada"
};

