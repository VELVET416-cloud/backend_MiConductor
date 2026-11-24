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

    async obtenerTodos(filtros = {}) {
        const query = {};
        if (filtros.correoCliente) {
            query.correoCliente = String(filtros.correoCliente).toLowerCase().trim();
        }
        if (filtros.cliente) {
            query.cliente = filtros.cliente;
        }
        if (filtros.conductor) {
            query.conductorAsignado = filtros.conductor;
        }
        if (filtros.estado) {
            query.estado = String(filtros.estado).toUpperCase().trim();
        }
        return await Solicitud.find(query)
            .populate(populateSolicitud)
            .sort({
                createdAt: -1
            });
    }

    async obtenerPorId(id) {
        return await Solicitud.findById(id)
            .populate(populateSolicitud);
    }

    async obtenerPorCliente(clienteId) {
        return await Solicitud.find({
            cliente: clienteId
        });
    }

    async obtenerPorVehiculo(vehiculoId) {
        return await Solicitud.find({
            vehiculo: vehiculoId
        });
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

    async completar(id, { comentarioConductor } = {}) {
        const update = { estado: "COMPLETADO" };
        if (comentarioConductor !== undefined && comentarioConductor !== null) {
            update.comentarioConductor = comentarioConductor;
        }
        return await Solicitud.findOneAndUpdate(
            {
                _id: id
            },
            update,
            {
                new: true,
                runValidators: true
            }
        ).populate(populateSolicitud);
    }

    async calificar(id, { calificacion, comentarioCliente } = {}) {
        const update = { calificacionConductor: calificacion };
        if (comentarioCliente !== undefined && comentarioCliente !== null) {
            update.comentarioCliente = comentarioCliente;
        }
        return await Solicitud.findOneAndUpdate(
            {
                _id: id
            },
            update,
            {
                new: true,
                runValidators: true
            }
        ).populate(populateSolicitud);
    }

}

export default new SolicitudRepository();