import mongoose from "mongoose";

import NovedadRepository from "./novedad.repository.js";
import SolicitudRepository from "../solicitud/solicitud.repository.js";
import ConductorRepository from "../conductor/conductor.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";

import AppError from "../../utils/AppError.js";

class NovedadService {

    // ======================================================
    // CREAR NOVEDAD
    // ======================================================

    async crear(datos) {

        datos.titulo = datos.titulo.trim();
        datos.descripcion = datos.descripcion.trim();
        datos.tipo = datos.tipo.trim().toUpperCase();
        datos.severidad = datos.severidad.trim().toUpperCase();

        if (datos.observaciones !== null && datos.observaciones !== undefined && datos.observaciones.trim) {
            datos.observaciones = datos.observaciones.trim();
        }

        if (datos.evidenciaUrl !== null && datos.evidenciaUrl !== undefined && datos.evidenciaUrl.trim) {
            datos.evidenciaUrl = datos.evidenciaUrl.trim();
        }

        if (datos.estadoNovedad) {
            datos.estadoNovedad = datos.estadoNovedad.trim().toUpperCase();
        }

        // Validar solicitud (si existe)
        if (datos.solicitud) {

            if (!mongoose.Types.ObjectId.isValid(datos.solicitud)) {
                throw new AppError(
                    "La solicitud enviada no es válida.",
                    400
                );
            }

            const solicitud = await SolicitudRepository.obtenerPorId(
                datos.solicitud
            );

            if (!solicitud) {
                throw new AppError(
                    "La solicitud no existe.",
                    404
                );
            }

        }

        // Validar conductor (si existe)
        if (datos.conductor) {

            if (!mongoose.Types.ObjectId.isValid(datos.conductor)) {
                throw new AppError(
                    "El conductor enviado no es válido.",
                    400
                );
            }

            const conductor = await ConductorRepository.obtenerPorId(
                datos.conductor
            );

            if (!conductor) {
                throw new AppError(
                    "El conductor no existe.",
                    404
                );
            }

        }

        // Validar usuarioRegistro (obligatorio)
        if (!mongoose.Types.ObjectId.isValid(datos.usuarioRegistro)) {
            throw new AppError(
                "El usuario de registro enviado no es válido.",
                400
            );
        }

        const usuario = await UsuarioRepository.obtenerPorId(
            datos.usuarioRegistro
        );

        if (!usuario) {
            throw new AppError(
                "El usuario de registro no existe.",
                404
            );
        }

        // Si se marca como RESUELTA o CERRADA, registrar fechaCierre
        if (
            datos.estadoNovedad === "RESUELTA" ||
            datos.estadoNovedad === "CERRADA"
        ) {
            if (!datos.fechaCierre) {
                datos.fechaCierre = new Date();
            }
        }

        return await NovedadRepository.crear(datos);

    }

    // ======================================================
    // OBTENER TODAS LAS NOVEDADES
    // ======================================================

    async obtenerTodos() {

        return await NovedadRepository.obtenerTodos();

    }

    // ======================================================
    // OBTENER POR ID
    // ======================================================

    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id de la novedad no es válido.",
                400
            );
        }

        const novedad = await NovedadRepository.obtenerPorId(id);

        if (!novedad) {
            throw new AppError(
                "Novedad no encontrada.",
                404
            );
        }

        return novedad;

    }

    // ======================================================
    // OBTENER POR SOLICITUD
    // ======================================================

    async obtenerPorSolicitud(solicitudId) {

        if (!mongoose.Types.ObjectId.isValid(solicitudId)) {
            throw new AppError(
                "El id de la solicitud no es válido.",
                400
            );
        }

        const solicitud = await SolicitudRepository.obtenerPorId(solicitudId);

        if (!solicitud) {
            throw new AppError(
                "La solicitud no existe.",
                404
            );
        }

        return await NovedadRepository.obtenerPorSolicitud(solicitudId);

    }

    // ======================================================
    // OBTENER POR CONDUCTOR
    // ======================================================

    async obtenerPorConductor(conductorId) {

        if (!mongoose.Types.ObjectId.isValid(conductorId)) {
            throw new AppError(
                "El id del conductor no es válido.",
                400
            );
        }

        const conductor = await ConductorRepository.obtenerPorId(conductorId);

        if (!conductor) {
            throw new AppError(
                "El conductor no existe.",
                404
            );
        }

        return await NovedadRepository.obtenerPorConductor(conductorId);

    }

    // ======================================================
    // ACTUALIZAR
    // ======================================================

    async actualizar(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id de la novedad no es válido.",
                400
            );
        }

        const novedad = await NovedadRepository.obtenerPorId(id);

        if (!novedad) {
            throw new AppError(
                "Novedad no encontrada.",
                404
            );
        }

        // Regla: una novedad CERRADA no puede modificarse
        if (novedad.estadoNovedad === "CERRADA") {
            throw new AppError(
                "La novedad está cerrada y no puede modificarse.",
                400
            );
        }

        // Normalizar campos presentes
        if (datos.titulo) {
            datos.titulo = datos.titulo.trim();
        }

        if (datos.descripcion) {
            datos.descripcion = datos.descripcion.trim();
        }

        if (datos.tipo) {
            datos.tipo = datos.tipo.trim().toUpperCase();
        }

        if (datos.severidad) {
            datos.severidad = datos.severidad.trim().toUpperCase();
        }

        if (datos.estadoNovedad) {
            datos.estadoNovedad = datos.estadoNovedad.trim().toUpperCase();
        }

        if (datos.observaciones !== undefined && datos.observaciones !== null) {
            if (typeof datos.observaciones === "string") {
                datos.observaciones = datos.observaciones.trim();
            }
        }

        if (datos.evidenciaUrl !== undefined && datos.evidenciaUrl !== null) {
            if (typeof datos.evidenciaUrl === "string") {
                datos.evidenciaUrl = datos.evidenciaUrl.trim();
            }
        }

        // Validar solicitud si viene
        if (datos.solicitud !== undefined && datos.solicitud !== null) {

            if (!mongoose.Types.ObjectId.isValid(datos.solicitud)) {
                throw new AppError(
                    "La solicitud enviada no es válida.",
                    400
                );
            }

            const solicitud = await SolicitudRepository.obtenerPorId(
                datos.solicitud
            );

            if (!solicitud) {
                throw new AppError(
                    "La solicitud no existe.",
                    404
                );
            }

        }

        // Validar conductor si viene
        if (datos.conductor !== undefined && datos.conductor !== null) {

            if (!mongoose.Types.ObjectId.isValid(datos.conductor)) {
                throw new AppError(
                    "El conductor enviado no es válido.",
                    400
                );
            }

            const conductor = await ConductorRepository.obtenerPorId(
                datos.conductor
            );

            if (!conductor) {
                throw new AppError(
                    "El conductor no existe.",
                    404
                );
            }

        }

        // Validar usuarioRegistro si viene
        if (datos.usuarioRegistro) {

            if (!mongoose.Types.ObjectId.isValid(datos.usuarioRegistro)) {
                throw new AppError(
                    "El usuario de registro enviado no es válido.",
                    400
                );
            }

            const usuario = await UsuarioRepository.obtenerPorId(
                datos.usuarioRegistro
            );

            if (!usuario) {
                throw new AppError(
                    "El usuario de registro no existe.",
                    404
                );
            }

        }

        // Gestionar fechaCierre según estadoNovedad
        const estadoFinal = datos.estadoNovedad || novedad.estadoNovedad;

        if (
            estadoFinal === "RESUELTA" ||
            estadoFinal === "CERRADA"
        ) {
            if (datos.fechaCierre === undefined) {
                if (!novedad.fechaCierre) {
                    datos.fechaCierre = new Date();
                }
            }
        } else {
            // Si vuelve a PENDIENTE o EN_ATENCION y no se envía fechaCierre, limpiarla
            if (datos.fechaCierre === undefined && novedad.fechaCierre) {
                datos.fechaCierre = null;
            }
        }

        return await NovedadRepository.actualizar(
            id,
            datos
        );

    }

    // ======================================================
    // CAMBIAR ESTADO NOVEDAD
    // ======================================================

    async cambiarEstado(id, estadoNovedad, observaciones = null) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id de la novedad no es válido.",
                400
            );
        }

        const novedad = await NovedadRepository.obtenerPorId(id);

        if (!novedad) {
            throw new AppError(
                "Novedad no encontrada.",
                404
            );
        }

        // Regla: no se puede cambiar el estado de una novedad CERRADA
        if (novedad.estadoNovedad === "CERRADA") {
            throw new AppError(
                "La novedad está cerrada y no puede cambiar de estado.",
                400
            );
        }

        estadoNovedad = estadoNovedad.trim().toUpperCase();

        const datosActualizar = {
            estadoNovedad
        };

        if (observaciones !== null && observaciones !== undefined) {
            if (typeof observaciones === "string") {
                datosActualizar.observaciones = observaciones.trim();
            } else {
                datosActualizar.observaciones = observaciones;
            }
        }

        // Gestionar fechaCierre
        if (
            estadoNovedad === "RESUELTA" ||
            estadoNovedad === "CERRADA"
        ) {
            if (!novedad.fechaCierre) {
                datosActualizar.fechaCierre = new Date();
            }
        } else {
            if (novedad.fechaCierre) {
                datosActualizar.fechaCierre = null;
            }
        }

        return await NovedadRepository.cambiarEstado(
            id,
            datosActualizar
        );

    }

    // ======================================================
    // ELIMINAR
    // ======================================================

    async eliminar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id de la novedad no es válido.",
                400
            );
        }

        const novedad = await NovedadRepository.obtenerPorId(id);

        if (!novedad) {
            throw new AppError(
                "Novedad no encontrada.",
                404
            );
        }

        await NovedadRepository.eliminar(id);

        return;

    }

}

export default new NovedadService();
