import mongoose from "mongoose";

import VehiculoRepository from "./vehiculo.repository.js";
import ClienteRepository from "../cliente/cliente.repository.js";
import SolicitudRepository from "../solicitud/solicitud.repository.js";
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

        let cliente = await ClienteRepository.obtenerPorId(
            datos.cliente
        );

        // Si no se encontró por ID de Cliente, intentar buscar por ID de Usuario
        if (!cliente) {
            cliente = await ClienteRepository.obtenerPorUsuario(datos.cliente);
        }

        if (!cliente) {
            throw new AppError(
                "El cliente no existe.",
                404
            );
        }

        // Asegurarnos de guardar con el ID correcto del Cliente
        datos.cliente = cliente._id;

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
    async obtenerTodos(page, limit, search, estado) {

        return await VehiculoRepository.obtenerTodos(page, limit, search, estado);

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

        let cliente = await ClienteRepository.obtenerPorId(clienteId);
        if (!cliente) {
            cliente = await ClienteRepository.obtenerPorUsuario(clienteId);
        }

        const idReal = cliente ? cliente._id : clienteId;

        return await VehiculoRepository.obtenerPorCliente(
            idReal
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

        if (datos.cliente) {
            let cliente = await ClienteRepository.obtenerPorId(datos.cliente);
            if (!cliente) {
                cliente = await ClienteRepository.obtenerPorUsuario(datos.cliente);
            }
            if (!cliente) {
                throw new AppError("El cliente no existe.", 404);
            }
            datos.cliente = cliente._id;
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

        const solicitudes = await SolicitudRepository.obtenerPorVehiculo(id);

        if (solicitudes && solicitudes.length > 0) {
            throw new AppError("El vehículo tiene solicitudes de servicio registradas y no puede ser eliminado.", 400);
        }

        // Eliminación física
        await VehiculoRepository.eliminarFisico(id);

        return;

    }

}

export default new VehiculoService();