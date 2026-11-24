import Vehiculo from "./vehiculo.model.js";

class VehiculoRepository {

    async crear(datosVehiculo) {
        return await Vehiculo.create(datosVehiculo);
    }

    async obtenerTodos() {
        return await Vehiculo.find({ estado: true })
            .populate({
                path: "cliente",
                populate: {
                    path: "usuario",
                    select: "-password",
                    populate: {
                        path: "rol",
                        select: "nombre descripcion"
                    }
                }
            })
            .sort({ createdAt: -1 });
    }

    async obtenerPorId(id) {
        return await Vehiculo.findOne({
            _id: id,
            estado: true
        }).populate({
            path: "cliente",
            populate: {
                path: "usuario",
                select: "-password",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            }
        });
    }

    async obtenerPorCliente(clienteId) {
        return await Vehiculo.find({
            cliente: clienteId,
            estado: true
        });
    }

    async obtenerPorPlaca(placa) {
        return await Vehiculo.findOne({
            placa
        });
    }

    async obtenerPorChasis(numeroChasis) {
        return await Vehiculo.findOne({
            numeroChasis
        });
    }

    async actualizar(id, datosVehiculo) {
        return await Vehiculo.findOneAndUpdate(
            {
                _id: id,
                estado: true
            },
            datosVehiculo,
            {
                new: true,
                runValidators: true
            }
        ).populate({
            path: "cliente",
            populate: {
                path: "usuario",
                select: "-password",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            }
        });
    }

    async eliminar(id) {
        return await Vehiculo.findByIdAndUpdate(
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

export default new VehiculoRepository();