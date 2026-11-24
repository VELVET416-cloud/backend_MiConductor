import mongoose from "mongoose";
import SeguimientoRepository from "./seguimiento.repository.js";
import ServicioRepository from "../servicio/servicio.repository.js";
import AppError from "../../utils/AppError.js";

class SeguimientoService {

    // ======================================================
    // INICIAR SEGUIMIENTO
    // Se llama automaticamente desde ServicioService.iniciar()
    // ======================================================

    async iniciar(servicioId, conductorId) {

        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            throw new AppError(
                "El id del servicio no es valido.",
                400
            );
        }

        if (!mongoose.Types.ObjectId.isValid(conductorId)) {
            throw new AppError(
                "El id del conductor no es valido.",
                400
            );
        }

        const servicio =
            await ServicioRepository.obtenerPorId(servicioId);

        if (!servicio) {
            throw new AppError(
                "El servicio no existe.",
                404
            );
        }

        const seguimientoExistente =
            await SeguimientoRepository.obtenerPorServicio(
                servicioId
            );

        if (seguimientoExistente) {
            throw new AppError(
                "Ya existe un seguimiento para este servicio.",
                409
            );
        }

        return await SeguimientoRepository.crear({
            servicio: servicioId,
            conductor: conductorId,
            estado: "ACTIVO",
            coordenadas: [],
            fechaInicio: new Date()
        });

    }

    // ======================================================
    // OBTENER TODOS
    // ======================================================

    async obtenerTodos() {
        return await SeguimientoRepository.obtenerTodos();
    }

    // ======================================================
    // OBTENER POR ID
    // ======================================================

    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del seguimiento no es valido.",
                400
            );
        }

        const seguimiento =
            await SeguimientoRepository.obtenerPorId(id);

        if (!seguimiento) {
            throw new AppError(
                "Seguimiento no encontrado.",
                404
            );
        }

        return seguimiento;

    }

    // ======================================================
    // OBTENER POR SERVICIO
    // ======================================================

    async obtenerPorServicio(servicioId) {

        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            throw new AppError(
                "El id del servicio no es valido.",
                400
            );
        }

        return await SeguimientoRepository.obtenerPorServicio(
            servicioId
        );

    }

    // ======================================================
    // OBTENER ACTIVOS
    // ======================================================

    async obtenerActivos() {
        return await SeguimientoRepository.obtenerActivos();
    }

    // ======================================================
    // AGREGAR COORDENADA
    // Se usa desde Socket.IO y desde endpoint de testing
    // ======================================================

    async agregarCoordenada(servicioId, coordenada) {

        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            throw new AppError(
                "El id del servicio no es valido.",
                400
            );
        }

        const seguimiento =
            await SeguimientoRepository.obtenerPorServicio(
                servicioId
            );

        if (!seguimiento) {
            throw new AppError(
                "No existe un seguimiento para este servicio.",
                404
            );
        }

        if (seguimiento.estado !== "ACTIVO") {
            throw new AppError(
                "El seguimiento no esta activo.",
                400
            );
        }

        if (
            typeof coordenada.lat !== "number" ||
            typeof coordenada.lng !== "number"
        ) {
            throw new AppError(
                "Las coordenadas deben ser numeros validos.",
                400
            );
        }

        return await SeguimientoRepository.agregarCoordenada(
            servicioId,
            coordenada
        );

    }

    // ======================================================
    // FINALIZAR SEGUIMIENTO
    // Se llama automaticamente desde ServicioService.finalizar()
    // ======================================================

    async finalizar(servicioId) {

        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            throw new AppError(
                "El id del servicio no es valido.",
                400
            );
        }

        return await SeguimientoRepository.finalizarPorServicio(
            servicioId
        );

    }

    // ======================================================
    // CANCELAR SEGUIMIENTO
    // Se llama automaticamente desde ServicioService.cancelar()
    // ======================================================

    async cancelar(servicioId) {

        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            throw new AppError(
                "El id del servicio no es valido.",
                400
            );
        }

        return await SeguimientoRepository.cancelarPorServicio(
            servicioId
        );

    }

}

export default new SeguimientoService();