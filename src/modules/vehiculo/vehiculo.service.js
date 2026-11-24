import mongoose from "mongoose";

import VehiculoRepository from "./vehiculo.repository.js";
import ClienteRepository from "../cliente/cliente.repository.js";
import AppError from "../../utils/AppError.js";

class VehiculoService {

    // Crear vehículo
    async crear(datos) {

        // Normalizar
        datos.marca = datos.marca.trim();
        datos.modelo = datos.modelo.trim();
        datos.placa = datos.placa.trim().toUpperCase();
        datos.numeroChasis = datos.numeroChasis.trim().toUpperCase();
        datos.color = datos.color.trim();

        // Validar cliente
        if (!mongoose.Types.ObjectId.isValid(datos.cliente)) {
            throw new AppError(
                "El cliente enviado no es válido.",
                400
            );
        }

        const cliente = await ClienteRepository.obtenerPorId(
            datos.cliente
        );

        if (!cliente) {
            throw new AppError(
                "El cliente no existe.",
                404
            );
        }

        // Validar placa
        const placaExiste =
            await VehiculoRepository.obtenerPorPlaca(
                datos.placa
            );

        if (placaExiste) {
            throw new AppError(
                "Ya existe un vehículo con esa placa.",
                409
            );
        }

        // Validar chasis
        const chasisExiste =
            await VehiculoRepository.obtenerPorChasis(
                datos.numeroChasis
            );

        if (chasisExiste) {
            throw new AppError(
                "Ya existe un vehículo con ese número de chasis.",
                409
            );
        }

        return await VehiculoRepository.crear(datos);

    }

    // Obtener todos
    async obtenerTodos() {

        return await VehiculoRepository.obtenerTodos();

    }

    // Obtener por ID
    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del vehículo no es válido.",
                400
            );
        }

        const vehiculo =
            await VehiculoRepository.obtenerPorId(id);

        if (!vehiculo) {
            throw new AppError(
                "Vehículo no encontrado.",
                404
            );
        }

        return vehiculo;

    }

    // Obtener vehículos por cliente
    async obtenerPorCliente(clienteId) {

        if (!mongoose.Types.ObjectId.isValid(clienteId)) {
            throw new AppError(
                "El id del cliente no es válido.",
                400
            );
        }

        return await VehiculoRepository.obtenerPorCliente(
            clienteId
        );

    }

    // Actualizar
    async actualizar(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del vehículo no es válido.",
                400
            );
        }

        const vehiculo =
            await VehiculoRepository.obtenerPorId(id);

        if (!vehiculo) {
            throw new AppError(
                "Vehículo no encontrado.",
                404
            );
        }

        if (datos.marca)
            datos.marca = datos.marca.trim();

        if (datos.modelo)
            datos.modelo = datos.modelo.trim();

        if (datos.color)
            datos.color = datos.color.trim();

        if (datos.placa) {

            datos.placa = datos.placa.trim().toUpperCase();

            if (datos.placa !== vehiculo.placa) {

                const placaExiste =
                    await VehiculoRepository.obtenerPorPlaca(
                        datos.placa
                    );

                if (placaExiste) {
                    throw new AppError(
                        "Ya existe un vehículo con esa placa.",
                        409
                    );
                }

            }

        }

        if (datos.numeroChasis) {

            datos.numeroChasis = datos.numeroChasis
                .trim()
                .toUpperCase();

            if (datos.numeroChasis !== vehiculo.numeroChasis) {

                const chasisExiste =
                    await VehiculoRepository.obtenerPorChasis(
                        datos.numeroChasis
                    );

                if (chasisExiste) {
                    throw new AppError(
                        "Ya existe un vehículo con ese número de chasis.",
                        409
                    );
                }

            }

        }

        return await VehiculoRepository.actualizar(
            id,
            datos
        );

    }

    // Eliminar
    async eliminar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del vehículo no es válido.",
                400
            );
        }

        const vehiculo =
            await VehiculoRepository.obtenerPorId(id);

        if (!vehiculo) {
            throw new AppError(
                "Vehículo no encontrado.",
                404
            );
        }

        await VehiculoRepository.eliminar(id);

        return;

    }

}

export default new VehiculoService();