import Usuario from "./usuario.model.js";

class UsuarioRepository {

    // Crear usuario
    async crear(datosUsuario) {
        return await Usuario.create(datosUsuario);
    }

    // Obtener todos los usuarios
    // Incluye activos e inactivos
    async obtenerTodos() {
        return await Usuario.find({})
            .populate("rol", "nombre descripcion")
            .sort({ createdAt: -1 });
    }

    // Obtener usuario por ID
    async obtenerPorId(id) {
        return await Usuario.findOne({
            _id: id
        }).populate("rol", "nombre descripcion");
    }

    // Obtener usuario por correo
    async obtenerPorCorreo(correo) {
        return await Usuario.findOne({
            correo
        });
    }

    // Obtener usuario por documento (comprobando combinación de tipo y número de documento y unicidad general)
    async obtenerPorDocumento(documento, tipoDocumento) {
        const docNormalizado = (documento || "").toString().trim();
        if (tipoDocumento) {
            const tipoNormalizado = tipoDocumento.toString().trim().toUpperCase();
            const porTipoYDocumento = await Usuario.findOne({
                tipoDocumento: tipoNormalizado,
                documento: docNormalizado
            });
            if (porTipoYDocumento) {
                return porTipoYDocumento;
            }
        }
        return await Usuario.findOne({
            documento: docNormalizado
        });
    }

    // Contar usuarios por rol
    // Solo cuenta usuarios activos
    async contarPorRol(rolId) {
        return await Usuario.countDocuments({
            rol: rolId,
            estado: true
        });
    }

    // Actualizar usuario
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

    // Eliminar usuario
    // Se realiza eliminación lógica:
    // estado pasa de true a false
    async eliminar(id) {
        return await Usuario.findOneAndUpdate(
            {
                _id: id
            },
            {
                estado: false
            },
            {
                new: true
            }
        ).populate("rol", "nombre descripcion");
    }

    // Eliminación física
    async eliminarFisico(id) {
        return await Usuario.findByIdAndDelete(id);
    }
}

export default new UsuarioRepository();
