
import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

import SolicitudRepository from "./solicitud.repository.js";
import ClienteRepository from "../cliente/cliente.repository.js";
import ConductorRepository from "../conductor/conductor.repository.js";
import VehiculoRepository from "../vehiculo/vehiculo.repository.js";
import ServicioService from "../servicio/servicio.service.js";
import ServicioRepository from "../servicio/servicio.repository.js";

import AppError from "../../utils/AppError.js";

const generarCodigoSolicitud = () => {
    const fecha = new Date();

    const fechaCodigo = [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, "0"),
        String(fecha.getDate()).padStart(2, "0")
    ].join("");

    return `SOL-${fechaCodigo}-${randomBytes(4).toString("hex").toUpperCase()}`;
};

const esErrorCodigoDuplicado = error =>
    error?.code === 11000 &&
    (error?.keyPattern?.codigo || error?.keyValue?.codigo);

class SolicitudService {
    async crear(datos) {
        datos.correoCliente = datos.correoCliente.trim().toLowerCase();
        datos.tipoServicio = datos.tipoServicio.trim();
        datos.descripcion = datos.descripcion.trim();
        datos.origen = datos.origen.trim();
        datos.destino = datos.destino.trim();
        datos.prioridad = datos.prioridad.trim().toUpperCase();

        if (!mongoose.Types.ObjectId.isValid(datos.cliente)) {
            throw new AppError(
                "El cliente enviado no es valido.",
                400
            );
        }

        const cliente = await ClienteRepository.obtenerPorId(datos.cliente);

        if (!cliente) {
            throw new AppError("El cliente no existe.", 404);
        }

        if (datos.vehiculo) {
            if (!mongoose.Types.ObjectId.isValid(datos.vehiculo)) {
                throw new AppError(
                    "El vehiculo enviado no es valido.",
                    400
                );
            }

            const vehiculo = await VehiculoRepository.obtenerPorId(
                datos.vehiculo
            );

            if (!vehiculo) {
                throw new AppError("El vehículo no existe.", 404);
            }
        }

        if (datos.conductorAsignado) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    datos.conductorAsignado
                )
            ) {
                throw new AppError(
                    "El conductor enviado no es valido.",
                    400
                );
            }

            const conductor = await ConductorRepository.obtenerPorId(
                datos.conductorAsignado
            );

            if (!conductor) {
                throw new AppError("El conductor no existe.", 404);
            }

            if (!conductor.disponible) {
                throw new AppError(
                    "El conductor no esta disponible.",
                    409
                );
            }
        }

        // El código, la fecha y el estado se generan en el backend.
        delete datos.codigo;
        delete datos.fechaProgramada;
        delete datos.estado;

        datos.estado = datos.conductorAsignado
            ? "EN_PROCESO"
            : "PENDIENTE";

        let solicitud;

        // Reintenta si se produce una colisión de código.
        for (let intento = 0; intento < 3; intento += 1) {
            datos.codigo = generarCodigoSolicitud();

            try {
                solicitud = await SolicitudRepository.crear({
                    ...datos,
                    fechaProgramada: new Date()
                });

                break;
            } catch (error) {
                if (esErrorCodigoDuplicado(error) && intento < 2) {
                    continue;
                }

                if (esErrorCodigoDuplicado(error)) {
                    throw new AppError(
                        "No fue posible generar un código único. Inténtalo nuevamente.",
                        409
                    );
                }

                throw error;
            }
        }

        if (!solicitud) {
            throw new AppError(
                "No fue posible crear la solicitud.",
                500
            );
        }

        if (datos.conductorAsignado) {
            await ServicioService.iniciar(
                solicitud._id.toString(),
                datos.conductorAsignado
            );
        }

        return solicitud;
    }

    async obtenerTodos() {
        return await SolicitudRepository.obtenerTodos();
    }

    async obtenerPorId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id de la solicitud no es valido.",
                400
            );
        }

        const solicitud = await SolicitudRepository.obtenerPorId(id);

        if (!solicitud) {
            throw new AppError("Solicitud no encontrada.", 404);
        }

        return solicitud;
    }

    async actualizar(id, datos) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id de la solicitud no es valido.",
                400
            );
        }

        const solicitud = await SolicitudRepository.obtenerPorId(id);

        if (!solicitud) {
            throw new AppError("Solicitud no encontrada.", 404);
        }

        if (["COMPLETADO", "CANCELADO"].includes(solicitud.estado)) {
            throw new AppError(
                "La solicitud ya no puede modificarse.",
                400
            );
        }

        if (datos.conductorAsignado !== undefined) {
            throw new AppError(
                "El conductor debe asignarse mediante el endpoint especifico.",
                400
            );
        }

        // Estos campos se gestionan mediante el flujo de negocio.
        delete datos.codigo;
        delete datos.fechaProgramada;
        delete datos.estado;

        if (datos.correoCliente) {
            datos.correoCliente = datos.correoCliente.trim().toLowerCase();
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
                    "El cliente enviado no es valido.",
                    400
                );
            }

            const cliente = await ClienteRepository.obtenerPorId(
                datos.cliente
            );

            if (!cliente) {
                throw new AppError("El cliente no existe.", 404);
            }
        }

        if (datos.vehiculo) {
            if (!mongoose.Types.ObjectId.isValid(datos.vehiculo)) {
                throw new AppError(
                    "El vehiculo enviado no es valido.",
                    400
                );
            }

            const vehiculo = await VehiculoRepository.obtenerPorId(
                datos.vehiculo
            );

            if (!vehiculo) {
                throw new AppError("El vehículo no existe.", 404);
            }
        }

        return await SolicitudRepository.actualizar(id, datos);
    }

    async asignarConductor(solicitudId, conductorId) {
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

        const solicitud = await SolicitudRepository.obtenerPorId(
            solicitudId
        );

        if (!solicitud) {
            throw new AppError("Solicitud no encontrada.", 404);
        }

        if (["COMPLETADO", "CANCELADO"].includes(solicitud.estado)) {
            throw new AppError(
                "La solicitud ya no puede modificarse.",
                400
            );
        }

        const conductor = await ConductorRepository.obtenerPorId(
            conductorId
        );

        if (!conductor) {
            throw new AppError("El conductor no existe.", 404);
        }

        if (!conductor.disponible) {
            throw new AppError(
                "El conductor no esta disponible.",
                409
            );
        }

        const servicioExistente =
            await ServicioRepository.obtenerPorSolicitud(solicitudId);

        if (servicioExistente) {
            const conductorServicio = String(
                servicioExistente.conductor?._id ??
                servicioExistente.conductor
            );

            if (conductorServicio !== String(conductorId)) {
                throw new AppError(
                    "La solicitud ya tiene un servicio iniciado con otro conductor.",
                    409
                );
            }

            // No iniciar nuevamente un servicio que ya existe.
            if (solicitud.estado !== "EN_PROCESO") {
                return await SolicitudRepository.asignarConductor(
                    solicitudId,
                    {
                        conductorAsignado: conductorId,
                        estado: "EN_PROCESO"
                    }
                );
            }

            return solicitud;
        }

        const resultado = await SolicitudRepository.asignarConductor(
            solicitudId,
            {
                conductorAsignado: conductorId,
                estado: "EN_PROCESO"
            }
        );

        // Iniciar el servicio después de asignar el conductor.
        await ServicioService.iniciar(solicitudId, conductorId);

        return resultado;
    }

    async cancelar(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id de la solicitud no es valido.",
                400
            );
        }

        const solicitud = await SolicitudRepository.obtenerPorId(id);

        if (!solicitud) {
            throw new AppError("Solicitud no encontrada.", 404);
        }

        if (["COMPLETADO", "CANCELADO"].includes(solicitud.estado)) {
            throw new AppError(
                "La solicitud ya no puede modificarse.",
                400
            );
        }

        const resultado = await SolicitudRepository.cancelar(id);

        await ServicioService.cancelar(id);

        return resultado;
    }

    async completar(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id de la solicitud no es valido.",
                400
            );
        }

        const solicitud = await SolicitudRepository.obtenerPorId(id);

        if (!solicitud) {
            throw new AppError("Solicitud no encontrada.", 404);
        }

        if (solicitud.estado !== "EN_PROCESO") {
            throw new AppError(
                "La solicitud no puede completarse desde ese estado.",
                400
            );
        }

        const resultado = await SolicitudRepository.completar(id);

        await ServicioService.finalizar(id);

        return resultado;
    }
}

export default new SolicitudService();
