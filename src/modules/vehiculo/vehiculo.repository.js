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

        const normalizeText = (str) =>
            String(str ?? '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();

        const searchWords = normalizeText(search).split(/\s+/).filter(Boolean);

        if (searchWords.length === 0) {
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

        // Búsqueda multicriterio sin distinguir mayúsculas ni tildes:
        // placa, marca, modelo, color, tipo, año, cliente asociado y estado (todos los términos deben coincidir)
        const allVehiculos = await Vehiculo.find(filter)
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

        const matchingVehiculos = allVehiculos.filter((v) => {
            const vStatus = (v.estadoVehiculo || (v.estado === false ? 'inactivo' : 'activo')).toLowerCase();
            const ownerUser = v.cliente?.usuario || {};
            const ownerName = `${ownerUser.nombre || v.cliente?.nombre || ''} ${ownerUser.apellido || v.cliente?.apellido || ''}`.trim();
            const ownerDoc = ownerUser.documento || v.cliente?.documento || '';
            const ownerEmail = ownerUser.correo || v.cliente?.correo || '';
            const ownerPhone = ownerUser.telefono || v.cliente?.telefono || '';

            const fieldsText = normalizeText([
                v.placa || '',
                v.marca || '',
                v.modelo || '',
                v.color || '',
                v.tipoVehiculo || '',
                v.anio ? String(v.anio) : '',
                ownerName,
                ownerDoc,
                ownerEmail,
                ownerPhone
            ].join(' '));

            const estadoTokens =
                vStatus === 'activo'
                    ? ['activo', 'activa', 'activos']
                    : vStatus === 'en_mantenimiento'
                    ? ['en_mantenimiento', 'mantenimiento']
                    : vStatus === 'vendido'
                    ? ['vendido', 'vendidos']
                    : ['inactivo', 'inactiva', 'inactivos', 'desactivado'];

            return searchWords.every((word) => {
                if (['activo', 'activa', 'activos'].includes(word)) {
                    return vStatus === 'activo' || fieldsText.includes(word);
                }
                if (['inactivo', 'inactiva', 'inactivos', 'desactivado'].includes(word)) {
                    return vStatus === 'inactivo' || fieldsText.includes(word);
                }
                return fieldsText.includes(word) || estadoTokens.some((t) => t.includes(word));
            });
        });

        const total = matchingVehiculos.length;
        const rows = matchingVehiculos.slice(skip, skip + limit);
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