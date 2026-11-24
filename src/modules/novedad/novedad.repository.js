import Novedad from "./novedad.model.js";

const populateNovedad = [
    {
        path: "solicitud",
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
    },
    {
        path: "usuarioRegistro",
        select: "-password",
        populate: {
            path: "rol",
            select: "nombre descripcion"
        }
    }
];

class NovedadRepository {

    async crear(datosNovedad) {
        return await Novedad.create(datosNovedad);
    }

    async obtenerTodos() {
        return await Novedad.find({ estado: true })
            .populate(populateNovedad)
            .sort({ createdAt: -1 });
    }

    async obtenerPorId(id) {
        return await Novedad.findOne({
            _id: id,
            estado: true
        }).populate(populateNovedad);
    }

    async obtenerPorSolicitud(solicitudId) {
        return await Novedad.find({
            solicitud: solicitudId,
            estado: true
        })
            .populate(populateNovedad)
            .sort({ createdAt: -1 });
    }

    async obtenerPorConductor(conductorId) {
        return await Novedad.find({
            conductor: conductorId,
            estado: true
        })
            .populate(populateNovedad)
            .sort({ createdAt: -1 });
    }

    async actualizar(id, datosNovedad) {
        return await Novedad.findOneAndUpdate(
            {
                _id: id,
                estado: true
            },
            datosNovedad,
            {
                new: true,
                runValidators: true
            }
        ).populate(populateNovedad);
    }

    async cambiarEstado(id, datosNovedad) {
        return await Novedad.findOneAndUpdate(
            {
                _id: id,
                estado: true
            },
            datosNovedad,
            {
                new: true,
                runValidators: true
            }
        ).populate(populateNovedad);
    }

    async eliminar(id) {
        return await Novedad.findByIdAndUpdate(
            id,
            {
                estado: false
            },
            {
                new: true
            }
        );
    }

}

export default new NovedadRepository();
