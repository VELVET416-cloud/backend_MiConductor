import InvitadoSolicitud from "./invitado.model.js";

const populateInvitadoSolicitud = [
    {
        path: "conductorAsignado",
        select: "usuario",
        populate: {
            path: "usuario",
            select: "nombre apellido"
        }
    }
];

class InvitadoRepository {

    async crearSolicitud(datosSolicitud) {
        return await InvitadoSolicitud.create(datosSolicitud);
    }

    async obtenerSolicitudPorCodigo(codigo) {
        return await InvitadoSolicitud.findOne({
            codigo
        }).populate(populateInvitadoSolicitud);
    }

}

export default new InvitadoRepository();