import InvitadoRepository from "./invitado.repository.js";

import AppError from "../../utils/AppError.js";

class InvitadoService {

    // ======================================================
    // CREAR SOLICITUD COMO INVITADO
    // ======================================================

    async crearSolicitud(datos) {

        const codigo = await this.generarCodigoUnico();

        const solicitudInvitado = await InvitadoRepository.crearSolicitud({
            codigo,
            tipoServicio: datos.tipoServicio.trim(),
            descripcion: datos.descripcion.trim(),
            origen: datos.origen.trim(),
            destino: datos.destino.trim(),
            fechaProgramada: datos.fechaProgramada,
            prioridad: datos.prioridad.trim().toUpperCase(),
            estado: "PENDIENTE",
            conductorAsignado: null
        });

        return this.mapearRespuestaPublica(solicitudInvitado);

    }

    // ======================================================
    // CONSULTAR SOLICITUD POR CÓDIGO
    // ======================================================

    async consultarSolicitudPorCodigo(codigo) {

        const solicitud = await InvitadoRepository.obtenerSolicitudPorCodigo(
            codigo.trim().toUpperCase()
        );

        if (!solicitud) {
            throw new AppError("Solicitud no encontrada.", 404);
        }

        return this.mapearRespuestaPublica(solicitud);

    }

    async generarCodigoUnico() {

        const intentosMaximos = 10;

        for (let intento = 0; intento < intentosMaximos; intento += 1) {
            const codigo = `INV-${Date.now()}-${Math.floor(
                1000 + Math.random() * 9000
            )}`;

            const existe =
                await InvitadoRepository.obtenerSolicitudPorCodigo(codigo);

            if (!existe) {
                return codigo;
            }
        }

        throw new AppError(
            "No fue posible generar el código de la solicitud. Intente nuevamente.",
            500
        );

    }

    mapearRespuestaPublica(solicitud) {
        const conductorAsignado = solicitud.conductorAsignado
            ? {
                id: solicitud.conductorAsignado._id,
                nombre: solicitud.conductorAsignado.usuario?.nombre || null,
                apellido: solicitud.conductorAsignado.usuario?.apellido || null
            }
            : null;

        return {
            codigo: solicitud.codigo,
            estado: solicitud.estado,
            origen: solicitud.origen,
            destino: solicitud.destino,
            tipoServicio: solicitud.tipoServicio,
            descripcion: solicitud.descripcion,
            fechaProgramada: solicitud.fechaProgramada,
            prioridad: solicitud.prioridad,
            conductorAsignado
        };
    }

}

export default new InvitadoService();