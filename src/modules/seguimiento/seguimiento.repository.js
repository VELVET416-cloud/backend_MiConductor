import Seguimiento from "./seguimiento.model.js";

const populateSeguimiento = [
    {
        path: "servicio",
        populate: [
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

class SeguimientoRepository {

    async crear(datosSeguimiento) {
        return await Seguimiento.create(datosSeguimiento);
    }

    async obtenerTodos() {
        return await Seguimiento.find()
            .populate(populateSeguimiento)
            .sort({ createdAt: -1 });
    }

    async obtenerPorId(id) {
        return await Seguimiento.findById(id)
            .populate(populateSeguimiento);
    }

    async obtenerPorServicio(servicioId) {
        return await Seguimiento.findOne({ servicio: servicioId })
            .populate(populateSeguimiento);
    }

    async obtenerActivos() {
        return await Seguimiento.find({ estado: "ACTIVO" })
            .populate(populateSeguimiento)
            .sort({ createdAt: -1 });
    }

    async agregarCoordenada(servicioId, coordenada) {
        return await Seguimiento.findOneAndUpdate(
            { servicio: servicioId, estado: "ACTIVO" },
            { $push: { coordenadas: coordenada } },
            { new: true, runValidators: true }
        ).populate(populateSeguimiento);
    }

    async finalizarPorServicio(servicioId) {
        return await Seguimiento.findOneAndUpdate(
            { servicio: servicioId, estado: "ACTIVO" },
            { estado: "FINALIZADO", fechaFin: new Date() },
            { new: true, runValidators: true }
        ).populate(populateSeguimiento);
    }

    async cancelarPorServicio(servicioId) {
        return await Seguimiento.findOneAndUpdate(
            { servicio: servicioId, estado: "ACTIVO" },
            { estado: "CANCELADO", fechaFin: new Date() },
            { new: true, runValidators: true }
        ).populate(populateSeguimiento);
    }

}

export default new SeguimientoRepository();