import Usuario from "./usuario.model.js";

class UsuarioRepository {

    async crear(datosUsuario) {
        return await Usuario.create(datosUsuario);
    }

    async obtenerTodos() {
        return await Usuario.find()
            .populate("rol", "nombre descripcion")
            .sort({ createdAt: -1 });
    }

    async obtenerPorId(id) {
        return await Usuario.findOne({
            _id: id
        }).populate("rol", "nombre descripcion");
    }

    async obtenerPorCorreo(correo) {
        return await Usuario.findOne({ correo });
    }

    async obtenerPorDocumento(documento) {
        return await Usuario.findOne({ documento });
    }

    async contarPorRol(rolId) {
        return await Usuario.countDocuments({
            rol: rolId,
            estado: true
        });
    }
    async actualizar(id, datosUsuario) {
        return await Usuario.findOneAndUpdate(
            {
                _id: id
            },
            datosUsuario,
            {
                new: true,
                runValidators: true
            }
        ).populate("rol", "nombre descripcion");
    }

    async eliminar(id) {
        return await Usuario.findByIdAndUpdate(
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

export default new UsuarioRepository();