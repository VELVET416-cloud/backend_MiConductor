import mongoose from "mongoose";
import vehiculoRepository from "./vehiculo.repository.js";
import AppError from "../../utils/AppError.js";

class VehiculoService {

    async crear(datos) {
        const existePlaca = await vehiculoRepository.obtenerPorPlaca(datos.placa);
        if (existePlaca) {
            throw new AppError("Ya existe un vehículo con esa placa.", 409);
        }

        return await vehiculoRepository.crear(datos);
    }

    async obtenerTodos() {
        return await vehiculoRepository.obtenerTodos();
    }

    async obtenerPorId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de vehículo inválido.", 400);
        }

        const vehiculo = await vehiculoRepository.obtenerPorId(id);
        if (!vehiculo) {
            throw new AppError("Vehículo no encontrado.", 404);
        }

        return vehiculo;
    }

    async obtenerPorPlaca(placa) {
        const vehiculo = await vehiculoRepository.obtenerPorPlaca(placa);
        if (!vehiculo) {
            throw new AppError("Vehículo no encontrado.", 404);
        }

        return vehiculo;
    }

    async obtenerPorConductor(conductorId) {
        if (!mongoose.Types.ObjectId.isValid(conductorId)) {
            throw new AppError("ID de conductor inválido.", 400);
        }

        return await vehiculoRepository.obtenerPorConductor(conductorId);
    }

    async actualizar(id, datos) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de vehículo inválido.", 400);
        }

        const vehiculo = await vehiculoRepository.obtenerPorId(id);
        if (!vehiculo) {
            throw new AppError("Vehículo no encontrado.", 404);
        }

        if (datos.placa && datos.placa !== vehiculo.placa) {
            const existePlaca = await vehiculoRepository.obtenerPorPlaca(datos.placa);
            if (existePlaca) {
                throw new AppError("Ya existe un vehículo con esa placa.", 409);
            }
        }

        return await vehiculoRepository.actualizar(id, datos);
    }

    async actualizarEstado(id, estado) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de vehículo inválido.", 400);
        }

        const vehiculo = await vehiculoRepository.obtenerPorId(id);
        if (!vehiculo) {
            throw new AppError("Vehículo no encontrado.", 404);
        }

        return await vehiculoRepository.actualizar(id, { estado });
    }

    async eliminar(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de vehículo inválido.", 400);
        }

        const vehiculo = await vehiculoRepository.obtenerPorId(id);
        if (!vehiculo) {
            throw new AppError("Vehículo no encontrado.", 404);
        }

        return await vehiculoRepository.eliminar(id);
    }

}

export default new VehiculoService();
