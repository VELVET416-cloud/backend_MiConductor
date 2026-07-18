import Rol from "./rol.model.js";

class RolRepository {

    async crear(datos) {
        return await Rol.create(datos);
    }

    async obtenerTodos() {
        return await Rol.find()
            .populate(
                "permisos",
                "nombre codigo modulo descripcion"
            );
    }

    async obtenerPorId(id) {
        return await Rol.findById(id)
            .populate(
                "permisos",
                "nombre codigo modulo descripcion"
            );
    }

    async obtenerPorNombre(nombre) {
        return await Rol.findOne({ nombre });
    }

    async actualizar(id, datos) {
        return await Rol.findByIdAndUpdate(
            id,
            datos,
            {
                new: true,
                runValidators: true
            }
        ).populate(
            "permisos",
            "nombre codigo modulo descripcion"
        );
    }

    async eliminar(id) {
        return await Rol.findByIdAndDelete(id);
    }

}

export default new RolRepository();