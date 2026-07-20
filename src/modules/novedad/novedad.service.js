import mongoose from "mongoose";
import novedadRepository from "./novedad.repository.js";
import AppError from "../../utils/AppError.js";

class NovedadService {

    async crear(datos) {
        return await novedadRepository.crear(datos);
    }

    async obtenerTodos() {
        return await novedadRepository.obtenerTodos();
    }

    async obtenerPorId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de novedad inválido.", 400);
        }

        const novedad = await novedadRepository.obtenerPorId(id);
        if (!novedad) {
            throw new AppError("Novedad no encontrada.", 404);
        }

        return novedad;
    }

    async obtenerPorServicio(servicioId) {
        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            throw new AppError("ID de servicio inválido.", 400);
        }

        return await novedadRepository.obtenerPorServicio(servicioId);
    }

    async obtenerPorConductor(conductorId) {
        if (!mongoose.Types.ObjectId.isValid(conductorId)) {
            throw new AppError("ID de conductor inválido.", 400);
        }

        return await novedadRepository.obtenerPorConductor(conductorId);
    }

    async actualizar(id, datos) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de novedad inválido.", 400);
        }

        const novedad = await novedadRepository.obtenerPorId(id);
        if (!novedad) {
            throw new AppError("Novedad no encontrada.", 404);
        }

        return await novedadRepository.actualizar(id, datos);
    }

    async actualizarEstado(id, estado) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de novedad inválido.", 400);
        }

        const novedad = await novedadRepository.obtenerPorId(id);
        if (!novedad) {
            throw new AppError("Novedad no encontrada.", 404);
        }

        return await novedadRepository.actualizar(id, { estado });
    }

    async eliminar(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de novedad inválido.", 400);
        }

        const novedad = await novedadRepository.obtenerPorId(id);
        if (!novedad) {
            throw new AppError("Novedad no encontrada.", 404);
        }

        return await novedadRepository.eliminar(id);
    }

}

export default new NovedadService();
