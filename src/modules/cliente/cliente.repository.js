import Cliente from "./cliente.model.js";
import Usuario from "../usuario/usuario.model.js";

class ClienteRepository {

    async crear(datosCliente) {
        return await Cliente.create(datosCliente);
    }

    async obtenerTodos(page = 1, limit = 10, search = '', estado = '') {
        const skip = (page - 1) * limit;

        let filter = {};

        if (estado !== undefined && estado !== '') {
            filter.estado = estado === 'true';
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
                Cliente.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .populate({
                        path: "usuario",
                        select: "-password",
                        populate: {
                            path: "rol",
                            select: "nombre descripcion"
                        }
                    })
                    .populate("vehiculos")
                    .sort({ createdAt: -1 }),
                Cliente.countDocuments(filter)
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
        // nombre, documento, correo, teléfono, dirección y estado (todos los términos deben coincidir)
        const allClientes = await Cliente.find(filter)
            .populate({
                path: "usuario",
                select: "-password",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            })
            .populate("vehiculos")
            .sort({ createdAt: -1 });

        const matchingClientes = allClientes.filter((c) => {
            const u = c.usuario || {};
            const clienteActivo = c.estado !== false && u.estado !== false;
            const nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.trim();
            const fieldsText = normalizeText([
                u.nombre || '',
                u.apellido || '',
                nombreCompleto,
                u.documento || '',
                u.tipoDocumento || '',
                u.correo || '',
                u.telefono || '',
                c.direccion || ''
            ].join(' '));

            const estadoTokens = clienteActivo
                ? ['activo', 'activa', 'activos', 'activas']
                : ['inactivo', 'inactiva', 'inactivos', 'inactivas', 'desactivado', 'desactivada'];

            return searchWords.every((word) => {
                if (['activo', 'activa', 'activos', 'activas'].includes(word)) {
                    return clienteActivo || fieldsText.includes(word);
                }
                if (['inactivo', 'inactiva', 'inactivos', 'inactivas', 'desactivado', 'desactivada'].includes(word)) {
                    return !clienteActivo || fieldsText.includes(word);
                }
                return fieldsText.includes(word) || estadoTokens.some((t) => t.startsWith(word));
            });
        });

        const total = matchingClientes.length;
        const rows = matchingClientes.slice(skip, skip + limit);
        const totalPages = Math.ceil(total / limit);

        return {
            rows,
            total,
            page,
            totalPages,
            limit
        };
    }

    async obtenerLista() {
        return await Cliente.find({ estado: true })
            .populate({
                path: "usuario",
                select: "-password",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            })
            .sort({ "usuario.nombre": 1 });
    }

    async obtenerPorId(id) {
        return await Cliente.findOne({
            _id: id
        }).populate({
            path: "usuario",
            select: "-password",
            populate: {
                path: "rol",
                select: "nombre descripcion"
            }
        });
    }

    async obtenerPorUsuario(usuarioId) {
        return await Cliente.findOne({
            usuario: usuarioId
        }).populate({
            path: "usuario",
            select: "-password",
            populate: {
                path: "rol",
                select: "nombre descripcion"
            }
        });
    }

    async actualizar(id, datosCliente) {
        return await Cliente.findOneAndUpdate(
            {
                _id: id
            },
            datosCliente,
            {
                new: true,
                runValidators: true
            }
        ).populate({
            path: "usuario",
            select: "-password",
            populate: {
                path: "rol",
                select: "nombre descripcion"
            }
        });
    }

    async eliminar(id) {
        return await Cliente.findByIdAndUpdate(
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
        return await Cliente.findByIdAndDelete(id);
    }

    async configurarTokenActivacionCliente(usuarioId, token, expiracion) {
        return await Usuario.findByIdAndUpdate(
            usuarioId,
            {
                activationToken: token,
                activationTokenExpires: expiracion,
                isActivated: false
            },
            { new: true }
        );
    }

    async obtenerUsuarioPorTokenActivacionCliente(token) {
        if (!token || typeof token !== "string") return null;
        return await Usuario.findOne({
            activationToken: token,
            isActivated: false,
            activationTokenExpires: {
                $gt: new Date()
            }
        })
            .select("+password +activationToken +activationTokenExpires")
            .populate("rol", "nombre");
    }

    async consumirTokenYActivarCliente(usuarioId, token, passwordHash) {
        return await Usuario.findOneAndUpdate(
            {
                _id: usuarioId,
                activationToken: token,
                isActivated: false,
                activationTokenExpires: {
                    $gt: new Date()
                }
            },
            {
                password: passwordHash,
                isActivated: true,
                estado: true,
                activationToken: null,
                activationTokenExpires: null
            },
            { new: true }
        );
    }

}

export default new ClienteRepository();