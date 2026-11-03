import { notificacionEventBus, NOTIFICACION_EVENTOS } from "./notificacion.events.js";
import notificacionService from "./notificacion.service.js";

let listenersRegistrados = false;

export const initNotificacionListeners = () => {
    if (listenersRegistrados) {
        return;
    }

    listenersRegistrados = true;

    // 1. Solicitud creada: avisar al administrador
    notificacionEventBus.on(NOTIFICACION_EVENTOS.SOLICITUD_CREADA, async (solicitud) => {
        try {
            await notificacionService.notificarSolicitudCreada(solicitud);
        } catch (error) {
            console.error("[Listener] Error en SOLICITUD_CREADA:", error.message);
        }
    });

    // 2. Servicio asignado: avisar al conductor asignado y al cliente
    notificacionEventBus.on(NOTIFICACION_EVENTOS.SERVICIO_ASIGNADO, async ({ servicio, solicitud }) => {
        try {
            await notificacionService.notificarServicioAsignado(servicio, solicitud);
        } catch (error) {
            console.error("[Listener] Error en SERVICIO_ASIGNADO:", error.message);
        }
    });

    // 3. Conductor en camino: avisar al cliente
    notificacionEventBus.on(NOTIFICACION_EVENTOS.CONDUCTOR_EN_CAMINO, async ({ servicio, solicitud }) => {
        try {
            await notificacionService.notificarConductorEnCamino(servicio, solicitud);
        } catch (error) {
            console.error("[Listener] Error en CONDUCTOR_EN_CAMINO:", error.message);
        }
    });

    // 4. Servicio completado: avisar al cliente y al administrador
    notificacionEventBus.on(NOTIFICACION_EVENTOS.SERVICIO_COMPLETADO, async ({ servicio, solicitud }) => {
        try {
            await notificacionService.notificarServicioCompletado(servicio, solicitud);
        } catch (error) {
            console.error("[Listener] Error en SERVICIO_COMPLETADO:", error.message);
        }
    });

    // 5. Solicitud cancelada: avisar a los destinatarios correspondientes
    notificacionEventBus.on(NOTIFICACION_EVENTOS.SOLICITUD_CANCELADA, async (solicitud, canceladoPor) => {
        try {
            await notificacionService.notificarSolicitudCancelada(solicitud, canceladoPor);
        } catch (error) {
            console.error("[Listener] Error en SOLICITUD_CANCELADA:", error.message);
        }
    });

    // 6. Novedad reportada: avisar al administrador
    notificacionEventBus.on(NOTIFICACION_EVENTOS.NOVEDAD_REPORTADA, async (novedad) => {
        try {
            await notificacionService.notificarNovedadReportada(novedad);
        } catch (error) {
            console.error("[Listener] Error en NOVEDAD_REPORTADA:", error.message);
        }
    });

    console.log("✅ [Notificaciones] Listeners de eventos de negocio inicializados.");
};

