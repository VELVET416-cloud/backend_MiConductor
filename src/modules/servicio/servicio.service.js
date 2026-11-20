import mongoose from "mongoose";
import ServicioRepository from "./servicio.repository.js";
import SolicitudRepository from "../solicitud/solicitud.repository.js";
import ConductorRepository from "../conductor/conductor.repository.js";
import ClienteRepository from "../cliente/cliente.repository.js";
import SeguimientoService from "../seguimiento/seguimiento.service.js";
import AppError from "../../utils/AppError.js";
import { subirACloudinary, eliminarDeCloudinary } from "../../utils/cloudinary.util.js";
import { ROLES } from "../../constants/permiso.js";
import { notificacionEventBus, NOTIFICACION_EVENTOS } from "../notificacion/notificacion.events.js";

const verificarPermisosGestionServicio = async (servicio, usuario) => {
    if (!usuario) {
        return;
    }

    const rol = (usuario.rol || "").toUpperCase();

    // 1. Administrador siempre tiene acceso total
    if (rol === ROLES.ADMIN || rol === "ADMINISTRADOR" || rol === "ADMIN") {
        return;
    }

    const usuarioIdStr = String(usuario.id || usuario._id);

    // 2. Conductor asignado al servicio
    if (rol === ROLES.CONDUCTOR || rol === "CONDUCTOR") {
        const conductorUsuarioId =
            servicio.conductor?.usuario?._id?.toString() ||
            servicio.conductor?.usuario?.toString();

        if (conductorUsuarioId) {
            if (conductorUsuarioId === usuarioIdStr) {
                return;
            }
            throw new AppError("No tiene permisos para modificar este servicio.", 403);
        }

        const conductorDelUsuario = await ConductorRepository.obtenerPorUsuario(usuarioIdStr);
        if (
            conductorDelUsuario &&
            String(servicio.conductor?._id || servicio.conductor) === String(conductorDelUsuario._id)
        ) {
            return;
        }

        throw new AppError("No tiene permisos para modificar este servicio.", 403);
    }

    // 3. Cliente asociado a la solicitud del servicio
    if (rol === ROLES.CLIENTE || rol === "CLIENTE") {
        const clienteUsuarioId =
            servicio.solicitud?.cliente?.usuario?._id?.toString() ||
            servicio.solicitud?.cliente?.usuario?.toString();

        if (clienteUsuarioId) {
            if (clienteUsuarioId === usuarioIdStr) {
                return;
            }
            throw new AppError("No tiene permisos para modificar este servicio.", 403);
        }

        const clienteDelUsuario = await ClienteRepository.obtenerPorUsuario(usuarioIdStr);
        if (
            clienteDelUsuario &&
            String(servicio.solicitud?.cliente?._id || servicio.solicitud?.cliente) === String(clienteDelUsuario._id)
        ) {
            return;
        }

        throw new AppError("No tiene permisos para modificar este servicio.", 403);
    }

    throw new AppError("No tiene permisos para realizar esta acción.", 403);
};

class ServicioService {

    // ======================================================
    // INICIAR SERVICIO
    // Se llama automaticamente desde SolicitudService.asignarConductor()
    // ======================================================

    async iniciar(solicitudId, conductorId) {

        if (!mongoose.Types.ObjectId.isValid(solicitudId)) {
            throw new AppError(
                "El id de la solicitud no es valido.",
                400
            );
        }

        if (!mongoose.Types.ObjectId.isValid(conductorId)) {
            throw new AppError(
                "El id del conductor no es valido.",
                400
            );
        }

        const servicioExistente =
            await ServicioRepository.obtenerPorSolicitud(
                solicitudId
            );

        if (servicioExistente) {
            throw new AppError(
                "Ya existe un servicio para esta solicitud.",
                409
            );
        }

        const conductor =
            await ConductorRepository.obtenerPorId(
                conductorId
            );

        if (!conductor) {
            throw new AppError(
                "El conductor no existe.",
                404
            );
        }

        const servicio = await ServicioRepository.crear({
            solicitud: solicitudId,
            conductor: conductorId,
            estado: "ACTIVO",
            fechaInicio: new Date()
        });

        // ======================================================
        // INICIAR SEGUIMIENTO AUTOMATICAMENTE
        // ======================================================
        await SeguimientoService.iniciar(
            servicio._id.toString(),
            conductorId
        );

        // ======================================================
        // NOTIFICAR ASIGNACIÓN A CONDUCTOR Y CLIENTE
        // ======================================================
        SolicitudRepository.obtenerPorId(solicitudId)
            .then((solicitud) => {
                notificacionEventBus.emit(NOTIFICACION_EVENTOS.SERVICIO_ASIGNADO, {
                    servicio,
                    solicitud
                });
            })
            .catch((e) => {
                console.error("Error al emitir evento SERVICIO_ASIGNADO:", e.message);
            });

        return servicio;

    }

    // ======================================================
    // OBTENER TODOS
    // ======================================================

    async obtenerTodos() {
        return await ServicioRepository.obtenerTodos();
    }

    // ======================================================
    // OBTENER POR ID
    // ======================================================

    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del servicio no es valido.",
                400
            );
        }

        const servicio =
            await ServicioRepository.obtenerPorId(id);

        if (!servicio) {
            throw new AppError(
                "Servicio no encontrado.",
                404
            );
        }

        return servicio;

    }

    // ======================================================
    // OBTENER POR SOLICITUD
    // ======================================================

    async obtenerPorSolicitud(solicitudId) {

        if (!mongoose.Types.ObjectId.isValid(solicitudId)) {
            throw new AppError(
                "El id de la solicitud no es valido.",
                400
            );
        }

        return await ServicioRepository.obtenerPorSolicitud(
            solicitudId
        );

    }

    // ======================================================
    // FINALIZAR SERVICIO
    // Se llama automaticamente desde SolicitudService.completar()
    // ======================================================

    async finalizar(solicitudId) {

        if (!mongoose.Types.ObjectId.isValid(solicitudId)) {
            throw new AppError(
                "El id de la solicitud no es valido.",
                400
            );
        }

        const servicio =
            await ServicioRepository.finalizarPorSolicitud(
                solicitudId
            );

        // ======================================================
        // FINALIZAR SEGUIMIENTO ASOCIADO
        // ======================================================
        if (servicio) {
            await SeguimientoService.finalizar(
                servicio._id.toString()
            );

            // ======================================================
            // NOTIFICAR SERVICIO COMPLETADO (Cliente y Administrador)
            // ======================================================
            SolicitudRepository.obtenerPorId(solicitudId)
                .then((solicitud) => {
                    notificacionEventBus.emit(NOTIFICACION_EVENTOS.SERVICIO_COMPLETADO, {
                        servicio,
                        solicitud
                    });
                })
                .catch((e) => {
                    console.error("Error al emitir evento SERVICIO_COMPLETADO:", e.message);
                });
        }

        return servicio;

    }

    // ======================================================
    // CANCELAR SERVICIO
    // Se llama automaticamente desde SolicitudService.cancelar()
    // ======================================================

    async cancelar(solicitudId) {

        if (!mongoose.Types.ObjectId.isValid(solicitudId)) {
            throw new AppError(
                "El id de la solicitud no es valido.",
                400
            );
        }

        const servicio =
            await ServicioRepository.cancelarPorSolicitud(
                solicitudId
            );

        // ======================================================
        // CANCELAR SEGUIMIENTO ASOCIADO
        // ======================================================
        if (servicio) {
            await SeguimientoService.cancelar(
                servicio._id.toString()
            );
        }

        return servicio;

    }

    // ======================================================
    // OBTENER SERVICIOS ACTIVOS POR CONDUCTOR
    // ======================================================

    async obtenerActivosPorConductor(conductorId) {

        if (!mongoose.Types.ObjectId.isValid(conductorId)) {
            throw new AppError(
                "El id del conductor no es valido.",
                400
            );
        }

        return await ServicioRepository.obtenerPorConductor(
            conductorId
        );

    }

    // ======================================================
    // SUBIR IMÁGENES AL SERVICIO (Cloudinary multipart/form-data)
    // ======================================================

    async subirImagenes(servicioId, archivos, usuario = null) {
        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            throw new AppError(
                "El id del servicio no es valido.",
                400
            );
        }

        if (!archivos || archivos.length === 0) {
            throw new AppError(
                "Debe proporcionar al menos una imagen para subir.",
                400
            );
        }

        const servicio = await ServicioRepository.obtenerPorId(servicioId);

        if (!servicio) {
            throw new AppError("Servicio no encontrado.", 404);
        }

        await verificarPermisosGestionServicio(servicio, usuario);

        if (["FINALIZADO", "CANCELADO"].includes(servicio.estado)) {
            throw new AppError(
                "No se pueden añadir evidencias a un servicio finalizado o cancelado.",
                400
            );
        }

        const MAX_IMAGENES = 10;
        const totalActual = servicio.imagenes?.length || 0;
        if (totalActual + archivos.length > MAX_IMAGENES) {
            throw new AppError(
                `Límite excedido: el servicio ya tiene ${totalActual} imagen(es) y el máximo total permitido es ${MAX_IMAGENES}.`,
                400
            );
        }

        const nuevasImagenes = [];
        try {
            for (const archivo of archivos) {
                const subida = await subirACloudinary(
                    archivo.buffer,
                    "mi_conductor/servicios"
                );

                nuevasImagenes.push({
                    url: subida.url,
                    public_id: subida.public_id,
                    formato: subida.formato || archivo.mimetype.split("/")[1]
                });
            }
        } catch (error) {
            for (const img of nuevasImagenes) {
                await eliminarDeCloudinary(img.public_id).catch(() => {});
            }
            throw error;
        }

        const servicioActualizado = await ServicioRepository.agregarImagenes(
            servicioId,
            nuevasImagenes
        );

        return servicioActualizado;
    }

    // ======================================================
    // AGREGAR IMAGENES AL SERVICIO (Compatibilidad con URLs / develop)
    // ======================================================

    async agregarImagenes(id, { imagenes = [], tipo = null }) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del servicio no es valido.",
                400
            );
        }

        const servicio = await ServicioRepository.obtenerPorId(id);

        if (!servicio) {
            throw new AppError(
                "Servicio no encontrado.",
                404
            );
        }

        const urlsValidas = Array.isArray(imagenes)
            ? imagenes.filter((img) => typeof img === "string" && img.trim().length > 0)
            : (typeof imagenes === "string" && imagenes.trim().length > 0 ? [imagenes.trim()] : []);

        const imagenesFormateadas = urlsValidas.map((urlStr) => ({
            url: urlStr,
            public_id: `url_externa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            formato: urlStr.split(".").pop()?.toLowerCase() || "jpg"
        }));

        const servicioActualizado = await ServicioRepository.agregarImagenes(id, {
            imagenes: imagenesFormateadas,
            tipo
        });

        return servicioActualizado;

    }

    // ======================================================
    // OBTENER IMÁGENES DEL SERVICIO
    // ======================================================

    async obtenerImagenes(servicioId, usuario = null) {
        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            throw new AppError(
                "El id del servicio no es valido.",
                400
            );
        }

        const servicio = await ServicioRepository.obtenerPorId(servicioId);

        if (!servicio) {
            throw new AppError("Servicio no encontrado.", 404);
        }

        return servicio.imagenes || [];
    }

    // ======================================================
    // ELIMINAR IMAGEN DEL SERVICIO (Cloudinary + MongoDB)
    // ======================================================

    async eliminarImagen(servicioId, imagenId, usuario = null) {
        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            throw new AppError(
                "El id del servicio no es valido.",
                400
            );
        }

        if (!mongoose.Types.ObjectId.isValid(imagenId)) {
            throw new AppError(
                "El id de la imagen no es valido.",
                400
            );
        }

        const servicio = await ServicioRepository.obtenerPorId(servicioId);

        if (!servicio) {
            throw new AppError("Servicio no encontrado.", 404);
        }

        await verificarPermisosGestionServicio(servicio, usuario);

        // No permitir borrar evidencias de servicios finalizados o cancelados salvo por administrador
        const esAdmin = usuario && [ROLES.ADMIN, "ADMINISTRADOR", "ADMIN"].includes((usuario.rol || "").toUpperCase());
        if (["FINALIZADO", "CANCELADO"].includes(servicio.estado) && !esAdmin) {
            throw new AppError(
                "No se pueden eliminar evidencias de un servicio finalizado o cancelado.",
                400
            );
        }

        const imagen = (servicio.imagenes || []).find(
            img => img._id.toString() === imagenId.toString()
        );

        if (!imagen) {
            throw new AppError(
                "La imagen no existe o no pertenece a este servicio.",
                404
            );
        }

        // Obtener el public_id EXCLUSIVAMENTE desde la base de datos verificada
        const publicId = imagen.public_id;

        // Eliminar de Cloudinary antes de retirar la referencia en la base de datos si no es externa
        if (publicId && !publicId.startsWith("url_externa_")) {
            try {
                await eliminarDeCloudinary(publicId);
            } catch (error) {
                throw new AppError(
                    `Error al eliminar la imagen de Cloudinary: ${error.message || "Fallo remoto"}. La referencia en la base de datos se mantuvo intacta.`,
                    502
                );
            }
        }

        // Retirar la referencia de MongoDB solo tras eliminación exitosa en Cloudinary
        const servicioActualizado = await ServicioRepository.eliminarImagen(
            servicioId,
            imagenId
        );

        return {
            servicio: servicioActualizado,
            imagenEliminada: {
                _id: imagen._id,
                public_id: imagen.public_id,
                url: imagen.url
            }
        };
    }

    // ======================================================
    // NOTIFICAR CONDUCTOR EN CAMINO
    // ======================================================
    async notificarEnCamino(servicioId, usuario = null) {
        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            throw new AppError("El id del servicio no es válido.", 400);
        }

        const servicio = await ServicioRepository.obtenerPorId(servicioId);
        if (!servicio) {
            throw new AppError("Servicio no encontrado.", 404);
        }

        if (usuario) {
            await verificarPermisosGestionServicio(servicio, usuario);
        }

        notificacionEventBus.emit(NOTIFICACION_EVENTOS.CONDUCTOR_EN_CAMINO, {
            servicio,
            solicitud: servicio.solicitud
        });

        return {
            mensaje: "Notificación enviada al cliente: conductor en camino.",
            servicioId: servicio._id
        };
    }

}

export default new ServicioService();
