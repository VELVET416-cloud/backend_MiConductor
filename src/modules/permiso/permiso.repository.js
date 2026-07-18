import Permiso from "./permiso.model.js";

class PermisoRepository {

    async crear(datos) {
        return await Permiso.create(datos);
    }

    async obtenerTodos() {
        return await Permiso.find();
    }

    async obtenerPorId(id) {
        return await Permiso.findById(id);
    }

    async obtenerPorCodigo(codigo) {
        return await Permiso.findOne({ codigo });
    }

    async actualizar(id, datos) {
        return await Permiso.findByIdAndUpdate(
            id,
            datos,
            {
                new: true,
                runValidators: true
            }
        );
    }

    async eliminar(id) {
        return await Permiso.findByIdAndDelete(id);
    }

}

export default new PermisoRepository();