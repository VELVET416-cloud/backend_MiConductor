import Servicio from "./servicio.model.js";

const populateServicio = [
    {
        path: "solicitud",
        populate: [
            {
                path: "cliente",
                populate: {
                    path: "usuario",
                    select: "-password",
                    populate: {
                        path: "rol",
                        select: "nombre descripcion"
                    }
                }
            },
            {
                path: "conductorAsignado",
                populate: {
                    path: "usuario",
                    select: "-password",
                    populate: {
                        path: "rol",
                        select: "nombre descripcion"
                    }
                }
            },
            {
                path: "vehiculo",
                populate: {
                    path: "cliente",
                    populate: {
                        path: "usuario",
                        select: "-password",
                        populate: {
                            path: "rol",
                            select: "nombre descripcion"
                        }
                    }
                }
            }
        ]
    },
    {
        path: "conductor",
        populate: {
            path: "usuario",
            select: "-password",
            populate: {
                path: "rol",
                select: "nombre descripcion"
            }
        }
    }
];

class ServicioRepository {

    async crear(datosServicio) {
        return await Servicio.create(datosServicio);
    }

    async obtenerTodos() {
        return await Servicio.find()
            .populate(populateServicio)
            .sort({ createdAt: -1 });
    }

    async obtenerPorId(id) {
        return await Servicio.findById(id)
            .populate(populateServicio);
    }

    async obtenerPorSolicitud(solicitudId) {
        return await Servicio.findOne({ solicitud: solicitudId })
            .populate(populateServicio);
    }

    async obtenerPorConductor(conductorId) {
        return await Servicio.find({
            conductor: conductorId,
            estado: "ACTIVO"
        })
            .populate(populateServicio)
            .sort({ createdAt: -1 });
    }

    async finalizarPorSolicitud(solicitudId) {
        return await Servicio.findOneAndUpdate(
            { solicitud: solicitudId, estado: "ACTIVO" },
            { estado: "FINALIZADO", fechaFin: new Date() },
            { new: true, runValidators: true }
        ).populate(populateServicio);
    }

    async cancelarPorSolicitud(solicitudId) {
        return await Servicio.findOneAndUpdate(
            { solicitud: solicitudId, estado: "ACTIVO" },
            { estado: "CANCELADO", fechaFin: new Date() },
            { new: true, runValidators: true }
        ).populate(populateServicio);
    }

}

export default new ServicioRepository();