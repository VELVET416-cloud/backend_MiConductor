import mongoose from "mongoose";

import SolicitudRepository from "./solicitud.repository.js";
import ClienteRepository from "../cliente/cliente.repository.js";
import ConductorRepository from "../conductor/conductor.repository.js";
import VehiculoRepository from "../vehiculo/vehiculo.repository.js";

import AppError from "../../utils/AppError.js";

class SolicitudService {

    // ======================================================
    // CREAR SOLICITUD
    // ======================================================

    async crear(datos) {

        datos.codigo = datos.codigo.trim().toUpperCase();
        datos.correoCliente = datos.correoCliente.trim().toLowerCase();
        datos.tipoServicio = datos.tipoServicio.trim();
        datos.descripcion = datos.descripcion.trim();
        datos.origen = datos.origen.trim();
        datos.destino = datos.destino.trim();
        datos.prioridad = datos.prioridad.trim().toUpperCase();

        if (!mongoose.Types.ObjectId.isValid(datos.cliente)) {

            throw new AppError(
                "El cliente enviado no es válido.",
                400
            );

        }

        const cliente =
            await ClienteRepository.obtenerPorId(
                datos.cliente
            );

        if (!cliente) {

            throw new AppError(
                "El cliente no existe.",
                404
            );

        }

        if (datos.vehiculo) {

            if (!mongoose.Types.ObjectId.isValid(datos.vehiculo)) {

                throw new AppError(
                    "El vehículo enviado no es válido.",
                    400
                );

            }

            const vehiculo =
                await VehiculoRepository.obtenerPorId(
                    datos.vehiculo
                );

            if (!vehiculo) {

                throw new AppError(
                    "El vehículo no existe.",
                    404
                );

            }

        }

        if (datos.conductorAsignado) {

            if (
                !mongoose.Types.ObjectId.isValid(
                    datos.conductorAsignado
                )
            ) {

                throw new AppError(
                    "El conductor enviado no es válido.",
                    400
                );

            }

            const conductor =
                await ConductorRepository.obtenerPorId(
                    datos.conductorAsignado
                );

            if (!conductor) {

                throw new AppError(
                    "El conductor no existe.",
                    404
                );

            }

            if (!conductor.disponible) {

                throw new AppError(
                    "El conductor no está disponible.",
                    409
                );

            }

        }

        const codigoExiste =
            await SolicitudRepository.obtenerPorCodigo(
                datos.codigo
            );

        if (codigoExiste) {

            throw new AppError(
                "Ya existe una solicitud con ese código.",
                409
            );

        }

        datos.estado = datos.conductorAsignado
            ? "EN_PROCESO"
            : "PENDIENTE";

        return await SolicitudRepository.crear(datos);

    }

    // ======================================================
    // OBTENER TODOS
    // ======================================================

    async obtenerTodos() {

        return await SolicitudRepository.obtenerTodos();

    }

    // ======================================================
    // OBTENER POR ID
    // ======================================================

    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id de la solicitud no es válido.",
                400
            );

        }

        const solicitud =
            await SolicitudRepository.obtenerPorId(id);

        if (!solicitud) {

            throw new AppError(
                "Solicitud no encontrada.",
                404
            );

        }

        return solicitud;

    }

    // ======================================================
    // ACTUALIZAR
    // ======================================================

    async actualizar(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id de la solicitud no es válido.",
                400
            );

        }

        const solicitud =
            await SolicitudRepository.obtenerPorId(id);

        if (!solicitud) {

            throw new AppError(
                "Solicitud no encontrada.",
                404
            );

        }

        if (
            solicitud.estado === "COMPLETADO" ||
            solicitud.estado === "CANCELADO"
        ) {

            throw new AppError(
                "La solicitud ya no puede modificarse.",
                400
            );

        }

        if (datos.conductorAsignado !== undefined) {

            throw new AppError(
                "El conductor debe asignarse mediante el endpoint específico.",
                400
            );

        }

        if (datos.codigo) {

            datos.codigo = datos.codigo.trim().toUpperCase();

            if (datos.codigo !== solicitud.codigo) {

                const codigoExiste =
                    await SolicitudRepository.obtenerPorCodigo(
                        datos.codigo
                    );

                if (codigoExiste) {

                    throw new AppError(
                        "Ya existe una solicitud con ese código.",
                        409
                    );

                }

            }

        }

        if (datos.correoCliente) {
            datos.correoCliente =
                datos.correoCliente.trim().toLowerCase();
        }

        if (datos.tipoServicio) {
            datos.tipoServicio = datos.tipoServicio.trim();
        }

        if (datos.descripcion) {
            datos.descripcion = datos.descripcion.trim();
        }

        if (datos.origen) {
            datos.origen = datos.origen.trim();
        }

        if (datos.destino) {
            datos.destino = datos.destino.trim();
        }

        if (datos.prioridad) {
            datos.prioridad = datos.prioridad.trim().toUpperCase();
        }

        if (datos.cliente) {

            if (!mongoose.Types.ObjectId.isValid(datos.cliente)) {

                throw new AppError(
                    "El cliente enviado no es válido.",
                    400
                );

            }

            const cliente =
                await ClienteRepository.obtenerPorId(
                    datos.cliente
                );

            if (!cliente) {

                throw new AppError(
                    "El cliente no existe.",
                    404
                );

            }

        }

        if (datos.vehiculo) {

            if (!mongoose.Types.ObjectId.isValid(datos.vehiculo)) {

                throw new AppError(
                    "El vehículo enviado no es válido.",
                    400
                );

            }

            const vehiculo =
                await VehiculoRepository.obtenerPorId(
                    datos.vehiculo
                );

            if (!vehiculo) {

                throw new AppError(
                    "El vehículo no existe.",
                    404
                );

            }

        }

        return await SolicitudRepository.actualizar(
            id,
            datos
        );

    }

    // ======================================================
    // ASIGNAR CONDUCTOR
    // ======================================================

    async asignarConductor(
        solicitudId,
        conductorId
    ) {

        if (!mongoose.Types.ObjectId.isValid(solicitudId)) {

            throw new AppError(
                "El id de la solicitud no es válido.",
                400
            );

        }

        if (!mongoose.Types.ObjectId.isValid(conductorId)) {

            throw new AppError(
                "El id del conductor no es válido.",
                400
            );

        }

        const solicitud =
            await SolicitudRepository.obtenerPorId(
                solicitudId
            );

        if (!solicitud) {

            throw new AppError(
                "Solicitud no encontrada.",
                404
            );

        }

        if (
            solicitud.estado === "COMPLETADO" ||
            solicitud.estado === "CANCELADO"
        ) {

            throw new AppError(
                "La solicitud ya no puede modificarse.",
                400
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

        if (!conductor.disponible) {

            throw new AppError(
                "El conductor no está disponible.",
                409
            );

        }

        return await SolicitudRepository.asignarConductor(
            solicitudId,
            {
                conductorAsignado: conductorId,
                estado: "EN_PROCESO"
            }
        );

    }

    // ======================================================
    // CANCELAR SOLICITUD
    // ======================================================

    async cancelar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id de la solicitud no es válido.",
                400
            );

        }

        const solicitud =
            await SolicitudRepository.obtenerPorId(id);

        if (!solicitud) {

            throw new AppError(
                "Solicitud no encontrada.",
                404
            );

        }

        if (
            solicitud.estado === "COMPLETADO" ||
            solicitud.estado === "CANCELADO"
        ) {

            throw new AppError(
                "La solicitud ya no puede modificarse.",
                400
            );

        }

        return await SolicitudRepository.cancelar(id);

    }

    // ======================================================
    // COMPLETAR SOLICITUD
    // ======================================================

    async completar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id de la solicitud no es válido.",
                400
            );

        }

        const solicitud =
            await SolicitudRepository.obtenerPorId(id);

        if (!solicitud) {

            throw new AppError(
                "Solicitud no encontrada.",
                404
            );

        }

        if (solicitud.estado !== "EN_PROCESO") {

            throw new AppError(
                "La solicitud no puede completarse desde ese estado.",
                400
            );

        }

        return await SolicitudRepository.completar(id);

    }

}

export default new SolicitudService();