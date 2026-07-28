import Permiso from "./permiso.model.js";

class PermisoRepository {

    async crear(datos) {
        return await Permiso.create(datos);
    }

    async obtenerTodos() {
        return await Permiso.find({
            activo: true
        }).sort({
            createdAt: -1
        });
    }

    async obtenerPorId(id) {
        return await Permiso.findOne({
            _id: id,
            activo: true
        });
    }

    async obtenerPorCodigo(codigo) {
        return await Permiso.findOne({
            codigo,
            activo: true
        });
    }

    async actualizar(id, datos) {
        return await Permiso.findOneAndUpdate(
            {
                _id: id,
                activo: true
            },
            datos,
            {
                new: true,
                runValidators: true
            }
        );
    }

    async eliminar(id) {
        return await Permiso.findByIdAndUpdate(
            id,
            {
                activo: false
            },
            {
                new: true
            }
        );
    }

}

export default new PermisoRepository();