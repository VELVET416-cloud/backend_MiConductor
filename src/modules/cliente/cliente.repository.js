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

        if (search && search.trim() !== '') {
            const q = new RegExp(search.trim(), 'i');
            const usuariosMatching = await Usuario.find({
                $or: [
                    { nombre: q },
                    { apellido: q },
                    { documento: q },
                    { correo: q },
                    { telefono: q }
                ]
            }).select('_id');
            const usuarioIds = usuariosMatching.map(u => u._id);
            
            filter.usuario = { $in: usuarioIds };
        }

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
            usuario: usuarioId,
            estado: true
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

}

export default new ClienteRepository();