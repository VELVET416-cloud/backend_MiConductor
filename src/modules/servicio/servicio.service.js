import mongoose from "mongoose";
import ServicioRepository from "./servicio.repository.js";
import ConductorRepository from "../conductor/conductor.repository.js";
import SeguimientoService from "../seguimiento/seguimiento.service.js";
import AppError from "../../utils/AppError.js";

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

}

export default new ServicioService();