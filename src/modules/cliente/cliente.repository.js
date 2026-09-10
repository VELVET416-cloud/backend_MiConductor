import Cliente from "./cliente.model.js";

class ClienteRepository {

    async crear(datosCliente) {
        return await Cliente.create(datosCliente);
    }

    async obtenerTodos() {
        return await Cliente.find({})
            .populate({
                path: "usuario",
                select: "-password",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            })
            .sort({ createdAt: -1 });
    }

    async obtenerPorId(id) {
        return await Cliente.findOne({
            _id: id,
            estado: true
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
                _id: id,
                estado: true
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