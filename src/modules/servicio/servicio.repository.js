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

    async agregarImagenes(id, payload) {
        let nuevasImagenes = [];
        let tipo = null;

        if (Array.isArray(payload)) {
            nuevasImagenes = payload;
        } else if (payload && typeof payload === "object") {
            nuevasImagenes = Array.isArray(payload.imagenes) ? payload.imagenes : [];
            tipo = payload.tipo || null;
        }

        const update = {
            $push: {
                imagenes: {
                    $each: nuevasImagenes
                }
            }
        };

        if (tipo === "inicial" && nuevasImagenes.length > 0) {
            const urls = nuevasImagenes.map((img) =>
                typeof img === "object" && img.url ? img.url : String(img)
            );
            update.$addToSet = update.$addToSet || {};
            update.$addToSet.fotosIniciales = { $each: urls };
        } else if (tipo === "entrega" && nuevasImagenes.length > 0) {
            const urls = nuevasImagenes.map((img) =>
                typeof img === "object" && img.url ? img.url : String(img)
            );
            update.$addToSet = update.$addToSet || {};
            update.$addToSet.fotosEntrega = { $each: urls };
        }

        return await Servicio.findByIdAndUpdate(
            id,
            update,
            {
                new: true,
                runValidators: true
            }
        ).populate(populateServicio);
    }

    async eliminarImagen(id, imagenId) {
        return await Servicio.findByIdAndUpdate(
            id,
            {
                $pull: {
                    imagenes: {
                        _id: imagenId
                    }
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).populate(populateServicio);
    }

}

export default new ServicioRepository();
