import Vehiculo from "./vehiculo.model.js";

class VehiculoRepository {

    async crear(datosVehiculo) {
        return await Vehiculo.create(datosVehiculo);
    }

    async obtenerTodos(page = 1, limit = 10, search = '', estado = '') {
        const skip = (page - 1) * limit;

        let filter = {};

        // Manejo de filtro por estado
        if (estado === 'vendido') {
            filter.estadoVehiculo = 'vendido';
        } else if (estado === 'en_mantenimiento') {
            filter.estadoVehiculo = 'en_mantenimiento';
        } else if (estado === 'inactivo' || estado === 'false') {
            filter.$or = [
                { estadoVehiculo: 'inactivo' },
                { estado: false, estadoVehiculo: { $nin: ['vendido', 'en_mantenimiento'] } }
            ];
        } else if (estado === 'activo' || estado === 'true') {
            filter.$or = [
                { estadoVehiculo: 'activo' },
                { estado: true, estadoVehiculo: { $exists: false } }
            ];
        } else {
            // Por defecto: NO listar los vehículos vendidos
            filter.estadoVehiculo = { $ne: 'vendido' };
        }

        if (search && search.trim() !== '') {
            const q = new RegExp(search.trim(), 'i');
            const searchCondition = {
                $or: [
                    { placa: q },
                    { marca: q },
                    { modelo: q }
                ]
            };
            if (filter.$or) {
                filter = { $and: [filter, searchCondition] };
            } else {
                Object.assign(filter, searchCondition);
            }
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
            estadoVehiculo: { $ne: 'vendido' },
            estado: true
        });
    }

    async obtenerPorPlaca(placa) {
        return await Vehiculo.findOne({
            placa: placa.toUpperCase()
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

    async cambiarEstado(id, { estadoNuevo, motivo, estadoAnterior }) {
        const estadoBoolean = estadoNuevo === 'activo' || estadoNuevo === 'en_mantenimiento';

        return await Vehiculo.findByIdAndUpdate(
            id,
            {
                $set: {
                    estadoVehiculo: estadoNuevo,
                    motivoCambioEstado: motivo || null,
                    estado: estadoBoolean
                },
                $push: {
                    historialEstados: {
                        estadoAnterior: estadoAnterior || null,
                        estadoNuevo: estadoNuevo,
                        motivo: motivo || null,
                        fecha: new Date()
                    }
                }
            },
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

    async obtenerPorChasis(numeroChasis) {
        if (!numeroChasis) return null;
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

    async eliminarFisico(id) {
        return await Vehiculo.findByIdAndDelete(id);
    }

}

export default new VehiculoRepository();