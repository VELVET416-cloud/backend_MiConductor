import Vehiculo from "./vehiculo.model.js";

class VehiculoRepository {

    async crear(datosVehiculo) {
        return await Vehiculo.create(datosVehiculo);
    }

    async obtenerTodos(page = 1, limit = 10, search = '', estado = '') {
        const skip = (page - 1) * limit;

        let filter = {};

        if (estado !== undefined && estado !== '') {
            filter.estado = estado === 'true';
        }

        if (search && search.trim() !== '') {
            const q = new RegExp(search.trim(), 'i');
            filter.$or = [
                { placa: q },
                { marca: q },
                { modelo: q }
            ];
        }

        const [rows, total] = await Promise.all([
            Vehiculo.find(filter)
                .skip(skip)
                .limit(limit)
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
                .sort({ createdAt: -1 }),
            Vehiculo.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            rows,
            total,
            page,
            totalPages,
            limit
        };
    }

    async obtenerPorId(id) {
        return await Vehiculo.findOne({
            _id: id
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
                _id: id
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