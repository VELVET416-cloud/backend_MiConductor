import mongoose from "mongoose";
import NotificacionRepository from "./notificacion.repository.js";
import Usuario from "../usuario/usuario.model.js";
import Rol from "../rol/rol.model.js";
import Cliente from "../cliente/cliente.model.js";
import Conductor from "../conductor/conductor.model.js";
import AppError from "../../utils/AppError.js";
import { getFirebaseMessaging, isFirebaseConfigured } from "../../config/firebase.js";
import {
    emitirNotificacionAUsuario,
    emitirNotificacionAAdmins,
    emitirNotificacionLeida,
    emitirTodasLeidas
} from "../../sockets/notificacion.socket.js";

/**
 * Función interna para enviar notificaciones push a través de FCM.
 * Se ejecuta en modo 'fire-and-forget' para nunca bloquear la API.
 */
async function enviarPushFCM(tokens, { titulo, mensaje, tipo, data = {} }) {
    if (!tokens || tokens.length === 0) return;

    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    try {
        const stringData = {
            tipo: String(tipo || "SISTEMA")
        };

        for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined) {
                stringData[key] = typeof value === "object" ? JSON.stringify(value) : String(value);
            }
        }

        const payload = {
            tokens,
            notification: {
                title: titulo,
                body: mensaje
            },
            data: stringData
        };

        const response = await messaging.sendEachForMulticast(payload);

        // Limpiar tokens inválidos o desregistrados
        const tokensInvalidos = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                const errorCode = resp.error?.code;
                if (
                    errorCode === "messaging/registration-token-not-registered" ||
                    errorCode === "messaging/invalid-registration-token" ||
                    errorCode === "messaging/invalid-argument"
                ) {
                    tokensInvalidos.push(tokens[idx]);
                }
            }
        });

        if (tokensInvalidos.length > 0) {
            console.log(`[FCM] Retirando ${tokensInvalidos.length} token(s) inválidos de la base de datos...`);
            await NotificacionRepository.eliminarTokensInvalidos(tokensInvalidos).catch(() => {});
        }
    } catch (error) {
        console.error("⚠️ [FCM] Error al enviar notificación push:", error.message);
    }
}

/**
 * Obtiene todos los IDs de usuarios activos con rol de ADMINISTRADOR.
 */
async function obtenerUsuariosAdministradores() {
    try {
        const rolAdmin = await Rol.findOne({
            nombre: { $in: ["ADMINISTRADOR", "ADMIN"] }
        });

        if (!rolAdmin) {
            return [];
        }

        return await Usuario.find({ rol: rolAdmin._id, estado: true });
    } catch (e) {
        return [];
    }
}

class NotificacionService {

    // ======================================================
    // LISTAR NOTIFICACIONES DEL USUARIO AUTENTICADO
    // ======================================================

    async listar(usuarioId, query = {}) {
        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }

        return await NotificacionRepository.listarPorUsuario(usuarioId, query);
    }

    // ======================================================
    // CONTADOR DE NO LEÍDAS
    // ======================================================

    async obtenerContadorNoLeidas(usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }

        const contador = await NotificacionRepository.contarNoLeidas(usuarioId);
        return { noLeidas: contador };
    }

    // ======================================================
    // MARCAR UNA NOTIFICACIÓN COMO LEÍDA
    // ======================================================

    async marcarComoLeida(id, usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El id de la notificación no es válido.", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }

        const notificacion = await NotificacionRepository.marcarComoLeida(id, usuarioId);

        if (!notificacion) {
            throw new AppError(
                "Notificación no encontrada o no pertenece al usuario autenticado.",
                404
            );
        }

        // Emitir evento por socket
        emitirNotificacionLeida(usuarioId, {
            id: notificacion._id,
            leida: true,
            fechaLectura: notificacion.fechaLectura
        });

        return notificacion;
    }

    // ======================================================
    // MARCAR TODAS LAS PROPIAS COMO LEÍDAS
    // ======================================================

    async marcarTodasComoLeidas(usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }

        const resultado = await NotificacionRepository.marcarTodasComoLeidas(usuarioId);

        // Emitir evento por socket
        emitirTodasLeidas(usuarioId);

        return {
            mensaje: "Todas las notificaciones fueron marcadas como leídas.",
            modificadas: resultado.modifiedCount
        };
    }

    // ======================================================
    // REGISTRAR / ACTUALIZAR TOKEN FCM DE DISPOSITIVO
    // ======================================================

    async registrarDispositivo(usuarioId, { token, plataforma }) {
        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }

        if (!token || typeof token !== "string") {
            throw new AppError("El token FCM es obligatorio.", 400);
        }

        const dispositivo = await NotificacionRepository.registrarDispositivo({
            usuario: usuarioId,
            token: token.trim(),
            plataforma: plataforma || "DESCONOCIDO"
        });

        return {
            registrado: true,
            mensaje: "Dispositivo registrado correctamente para notificaciones push.",
            dispositivo: {
                id: dispositivo._id,
                plataforma: dispositivo.plataforma,
                ultimoUso: dispositivo.ultimoUso
            }
        };
    }

    // ======================================================
    // DESVINCULAR DISPOSITIVO
    // ======================================================

    async desvincularDispositivo(usuarioId, token) {
        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }

        if (!token) {
            throw new AppError("El token FCM es obligatorio para desvincular.", 400);
        }

        await NotificacionRepository.desvincularDispositivo(usuarioId, token.trim());

        return {
            desvinculado: true,
            mensaje: "Dispositivo desvinculado correctamente."
        };
    }

    // ======================================================
    // ENVIAR NOTIFICACIÓN DE PRUEBA
    // ======================================================

    async enviarPrueba(usuarioId, { titulo, mensaje, tipo } = {}) {
        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }

        const tituloFinal = (titulo && typeof titulo === "string") ? titulo.trim() : "Prueba de Notificación";
        const mensajeFinal = (mensaje && typeof mensaje === "string") ? mensaje.trim() : "¡Hola! Esta es una notificación de prueba de Mi Conductor.";
        const tipoFinal = tipo || "SISTEMA";

        const notificacion = await this.crearYEnviarNotificacion({
            destinatario: usuarioId,
            titulo: tituloFinal,
            mensaje: mensajeFinal,
            tipo: tipoFinal,
            datosExtra: { origen: "PRUEBA_MANUAL", fecha: new Date().toISOString() }
        });

        const tokens = await NotificacionRepository.obtenerTokensPorUsuario(usuarioId);

        return {
            notificacion,
            destinatarioId: usuarioId,
            mongoGuardado: !!notificacion,
            socketEmitido: true,
            dispositivosRegistrados: tokens.length,
            firebaseConfigurado: isFirebaseConfigured(),
            mensajeFCM: tokens.length > 0
                ? `Despachado a ${tokens.length} token(s) FCM registrados para este usuario.`
                : "Guardada en MongoDB y emitida por Socket.IO. Para recibir alerta push en tu celular o emulador, primero registra el token en POST /api/notificaciones/dispositivos."
        };
    }

    // ======================================================
    // CREAR Y DISTRIBUIR NOTIFICACIÓN (BD + Push + Socket.IO)
    // ======================================================

    async crearYEnviarNotificacion({
        destinatario,
        titulo,
        mensaje,
        tipo = "SISTEMA",
        solicitud = null,
        servicio = null,
        novedad = null,
        datosExtra = {}
    }) {
        if (!destinatario) return null;

        try {
            // 1. Guardar en MongoDB
            const notificacion = await NotificacionRepository.crear({
                destinatario,
                titulo,
                mensaje,
                tipo,
                solicitud,
                servicio,
                novedad,
                datosExtra
            });

            // 2. Emitir en tiempo real por Socket.IO al usuario autorizado
            emitirNotificacionAUsuario(destinatario, notificacion);

            // 3. Enviar Push a los dispositivos activos del usuario (sin bloquear)
            NotificacionRepository.obtenerTokensPorUsuario(destinatario)
                .then((tokens) => {
                    return enviarPushFCM(tokens, {
                        titulo,
                        mensaje,
                        tipo,
                        data: {
                            notificacionId: notificacion._id.toString(),
                            solicitudId: solicitud?.toString ? solicitud.toString() : "",
                            servicioId: servicio?.toString ? servicio.toString() : "",
                            novedadId: novedad?.toString ? novedad.toString() : "",
                            ...datosExtra
                        }
                    });
                })
                .catch((err) => {
                    console.error("Error al despachar push FCM:", err.message);
                });

            return notificacion;
        } catch (error) {
            console.error("Error al crear y enviar notificación:", error.message);
            return null;
        }
    }

    // ======================================================
    // CREAR Y DISTRIBUIR A TODOS LOS ADMINISTRADORES
    // ======================================================

    async crearYEnviarParaAdmins({
        titulo,
        mensaje,
        tipo = "SISTEMA",
        solicitud = null,
        servicio = null,
        novedad = null,
        datosExtra = {}
    }) {
        try {
            const admins = await obtenerUsuariosAdministradores();

            if (!admins || admins.length === 0) {
                // Si no hay administradores en BD, emitir de todas formas al room de socket
                emitirNotificacionAAdmins({
                    titulo,
                    mensaje,
                    tipo,
                    solicitud,
                    servicio,
                    novedad,
                    createdAt: new Date()
                });
                return [];
            }

            const notificacionesCreadas = [];

            for (const admin of admins) {
                const notif = await this.crearYEnviarNotificacion({
                    destinatario: admin._id,
                    titulo,
                    mensaje,
                    tipo,
                    solicitud,
                    servicio,
                    novedad,
                    datosExtra
                });

                if (notif) {
                    notificacionesCreadas.push(notif);
                }
            }

            // Emitir al room general de administradores
            emitirNotificacionAAdmins({
                titulo,
                mensaje,
                tipo,
                solicitud,
                servicio,
                novedad,
                createdAt: new Date()
            });

            return notificacionesCreadas;
        } catch (error) {
            console.error("Error al notificar a administradores:", error.message);
            return [];
        }
    }

    // ======================================================
    // CONTROLADORES DE EVENTOS DE NEGOCIO
    // ======================================================

    /**
     * Solicitud creada: avisar al administrador.
     */
    async notificarSolicitudCreada(solicitud) {
        if (!solicitud) return;

        const codigo = solicitud.codigo || "nueva solicitud";
        const tipoServicio = solicitud.tipoServicio || "Servicio";

        await this.crearYEnviarParaAdmins({
            titulo: "Nueva solicitud de servicio",
            mensaje: `Se ha registrado la solicitud ${codigo} (${tipoServicio}).`,
            tipo: "SOLICITUD_CREADA",
            solicitud: solicitud._id,
            datosExtra: { codigo, tipoServicio }
        });
    }

    /**
     * Servicio asignado: avisar al conductor asignado y al cliente.
     */
    async notificarServicioAsignado(servicio, solicitud) {
        if (!servicio) return;

        try {
            // Obtener datos del conductor para extraer su usuario
            let conductorUsuarioId = null;
            if (servicio.conductor) {
                if (servicio.conductor.usuario) {
                    conductorUsuarioId = servicio.conductor.usuario._id || servicio.conductor.usuario;
                } else {
                    const cDoc = await Conductor.findById(servicio.conductor);
                    conductorUsuarioId = cDoc?.usuario;
                }
            }

            // Obtener datos del cliente para extraer su usuario
            let clienteUsuarioId = null;
            if (solicitud && solicitud.cliente) {
                if (solicitud.cliente.usuario) {
                    clienteUsuarioId = solicitud.cliente.usuario._id || solicitud.cliente.usuario;
                } else {
                    const clDoc = await Cliente.findById(solicitud.cliente);
                    clienteUsuarioId = clDoc?.usuario;
                }
            }

            const codigo = solicitud?.codigo || "Servicio";

            // 1. Notificar al conductor asignado
            if (conductorUsuarioId) {
                await this.crearYEnviarNotificacion({
                    destinatario: conductorUsuarioId,
                    titulo: "Nuevo servicio asignado",
                    mensaje: `Se te ha asignado el servicio correspondiente a la solicitud ${codigo}.`,
                    tipo: "SERVICIO_ASIGNADO",
                    servicio: servicio._id,
                    solicitud: solicitud?._id || servicio.solicitud,
                    datosExtra: { codigo }
                });
            }

            // 2. Notificar al cliente
            if (clienteUsuarioId) {
                await this.crearYEnviarNotificacion({
                    destinatario: clienteUsuarioId,
                    titulo: "Conductor asignado a tu solicitud",
                    mensaje: `Tu solicitud ${codigo} ya cuenta con un conductor asignado y el servicio está listo.`,
                    tipo: "SERVICIO_ASIGNADO",
                    servicio: servicio._id,
                    solicitud: solicitud?._id || servicio.solicitud,
                    datosExtra: { codigo }
                });
            }
        } catch (error) {
            console.error("Error al notificar servicio asignado:", error.message);
        }
    }

    /**
     * Conductor en camino: avisar al cliente.
     */
    async notificarConductorEnCamino(servicio, solicitud = null) {
        if (!servicio) return;

        try {
            let clienteUsuarioId = null;
            if (solicitud && solicitud.cliente) {
                if (solicitud.cliente.usuario) {
                    clienteUsuarioId = solicitud.cliente.usuario._id || solicitud.cliente.usuario;
                } else {
                    const clDoc = await Cliente.findById(solicitud.cliente);
                    clienteUsuarioId = clDoc?.usuario;
                }
            }

            if (clienteUsuarioId) {
                await this.crearYEnviarNotificacion({
                    destinatario: clienteUsuarioId,
                    titulo: "Conductor en camino",
                    mensaje: "Tu conductor asignado ya se encuentra en camino hacia el punto de origen.",
                    tipo: "CONDUCTOR_EN_CAMINO",
                    servicio: servicio._id,
                    solicitud: solicitud?._id || servicio.solicitud
                });
            }
        } catch (error) {
            console.error("Error al notificar conductor en camino:", error.message);
        }
    }

    /**
     * Servicio completado: avisar al cliente y al administrador.
     */
    async notificarServicioCompletado(servicio, solicitud = null) {
        if (!servicio) return;

        try {
            let clienteUsuarioId = null;
            if (solicitud && solicitud.cliente) {
                if (solicitud.cliente.usuario) {
                    clienteUsuarioId = solicitud.cliente.usuario._id || solicitud.cliente.usuario;
                } else {
                    const clDoc = await Cliente.findById(solicitud.cliente);
                    clienteUsuarioId = clDoc?.usuario;
                }
            }

            const codigo = solicitud?.codigo || "Servicio";

            // 1. Notificar al cliente
            if (clienteUsuarioId) {
                await this.crearYEnviarNotificacion({
                    destinatario: clienteUsuarioId,
                    titulo: "Servicio finalizado con éxito",
                    mensaje: `Tu servicio ${codigo} ha sido completado satisfactoriamente. ¡Gracias por confiar en nosotros!`,
                    tipo: "SERVICIO_COMPLETADO",
                    servicio: servicio._id,
                    solicitud: solicitud?._id || servicio.solicitud,
                    datosExtra: { codigo }
                });
            }

            // 2. Notificar al administrador
            await this.crearYEnviarParaAdmins({
                titulo: "Servicio completado",
                mensaje: `El servicio ${codigo} ha sido completado por el conductor.`,
                tipo: "SERVICIO_COMPLETADO",
                servicio: servicio._id,
                solicitud: solicitud?._id || servicio.solicitud,
                datosExtra: { codigo }
            });
        } catch (error) {
            console.error("Error al notificar servicio completado:", error.message);
        }
    }

    /**
     * Solicitud cancelada: avisar a los destinatarios correspondientes.
     */
    async notificarSolicitudCancelada(solicitud, canceladoPor = null) {
        if (!solicitud) return;

        try {
            let clienteUsuarioId = null;
            if (solicitud.cliente) {
                if (solicitud.cliente.usuario) {
                    clienteUsuarioId = solicitud.cliente.usuario._id || solicitud.cliente.usuario;
                } else {
                    const clDoc = await Cliente.findById(solicitud.cliente);
                    clienteUsuarioId = clDoc?.usuario;
                }
            }

            let conductorUsuarioId = null;
            if (solicitud.conductorAsignado) {
                if (solicitud.conductorAsignado.usuario) {
                    conductorUsuarioId = solicitud.conductorAsignado.usuario._id || solicitud.conductorAsignado.usuario;
                } else {
                    const cDoc = await Conductor.findById(solicitud.conductorAsignado);
                    conductorUsuarioId = cDoc?.usuario;
                }
            }

            const codigo = solicitud.codigo || "Solicitud";

            // Avisar al cliente
            if (clienteUsuarioId && String(clienteUsuarioId) !== String(canceladoPor)) {
                await this.crearYEnviarNotificacion({
                    destinatario: clienteUsuarioId,
                    titulo: "Solicitud cancelada",
                    mensaje: `La solicitud ${codigo} ha sido cancelada.`,
                    tipo: "SOLICITUD_CANCELADA",
                    solicitud: solicitud._id,
                    datosExtra: { codigo }
                });
            }

            // Avisar al conductor si estaba asignado
            if (conductorUsuarioId && String(conductorUsuarioId) !== String(canceladoPor)) {
                await this.crearYEnviarNotificacion({
                    destinatario: conductorUsuarioId,
                    titulo: "Servicio cancelado",
                    mensaje: `La solicitud ${codigo} asignada a tu vehículo ha sido cancelada.`,
                    tipo: "SOLICITUD_CANCELADA",
                    solicitud: solicitud._id,
                    datosExtra: { codigo }
                });
            }

            // Avisar a los administradores
            await this.crearYEnviarParaAdmins({
                titulo: "Solicitud cancelada",
                mensaje: `La solicitud ${codigo} fue cancelada.`,
                tipo: "SOLICITUD_CANCELADA",
                solicitud: solicitud._id,
                datosExtra: { codigo }
            });
        } catch (error) {
            console.error("Error al notificar cancelación:", error.message);
        }
    }

    /**
     * Novedad reportada: avisar al administrador.
     */
    async notificarNovedadReportada(novedad) {
        if (!novedad) return;

        try {
            const tituloNovedad = novedad.titulo || "Incidente reportado";
            const tipo = novedad.tipo || "GENERAL";
            const severidad = novedad.severidad || "MEDIA";

            await this.crearYEnviarParaAdmins({
                titulo: `Nueva novedad: ${tituloNovedad}`,
                mensaje: `Se ha registrado una novedad de tipo ${tipo} con severidad ${severidad}.`,
                tipo: "NOVEDAD_REPORTADA",
                novedad: novedad._id,
                solicitud: novedad.solicitud || null,
                datosExtra: { tipo, severidad }
            });
        } catch (error) {
            console.error("Error al notificar novedad reportada:", error.message);
        }
    }

}

export default new NotificacionService();

