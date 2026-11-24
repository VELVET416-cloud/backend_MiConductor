import Solicitud from "./solicitud.model.js";

const populateSolicitud = [
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
];

class SolicitudRepository {

    async crear(datosSolicitud) {
        return await Solicitud.create(datosSolicitud);
    }

    async obtenerTodos() {
        return await Solicitud.find()
            .populate(populateSolicitud)
            .sort({
                createdAt: -1
            });
    }

    async obtenerPorId(id) {
        return await Solicitud.findById(id)
            .populate(populateSolicitud);
    }

    async obtenerPorCodigo(codigo) {
        return await Solicitud.findOne({
            codigo
        });
    }

    async actualizar(id, datosSolicitud) {
        return await Solicitud.findOneAndUpdate(
            {
                _id: id
            },
            datosSolicitud,
            {
                new: true,
                runValidators: true
            }
        ).populate(populateSolicitud);
    }

    async asignarConductor(id, datosSolicitud) {
        return await Solicitud.findOneAndUpdate(
            {
                _id: id
            },
            datosSolicitud,
            {
                new: true,
                runValidators: true
            }
        ).populate(populateSolicitud);
    }

    async cancelar(id) {
        return await Solicitud.findOneAndUpdate(
            {
                _id: id
            },
            {
                estado: "CANCELADO"
            },
            {
                new: true,
                runValidators: true
            }
        ).populate(populateSolicitud);
    }

    async completar(id) {
        return await Solicitud.findOneAndUpdate(
            {
                _id: id
            },
            {
                estado: "COMPLETADO"
            },
            {
                new: true,
                runValidators: true
            }
        ).populate(populateSolicitud);
    }

}

export default new SolicitudRepository();