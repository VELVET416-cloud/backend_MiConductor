import Rol from "./rol.model.js";

class RolRepository {

    async crear(datos) {
        return await Rol.create(datos);
    }

    async obtenerTodos() {
        return await Rol.find({
            activo: true
        })
            .populate(
                "permisos",
                "nombre codigo modulo descripcion"
            )
            .sort({
                createdAt: -1
            });
    }

    async obtenerPorId(id) {
        return await Rol.findOne({
            _id: id,
            activo: true
        })
            .populate(
                "permisos",
                "nombre codigo modulo descripcion"
            );
    }

    async obtenerPorNombre(nombre) {
        return await Rol.findOne({
            nombre,
            activo: true
        });
    }

    async actualizar(id, datos) {
        return await Rol.findOneAndUpdate(
            {
                _id: id,
                activo: true
            },
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
        return await Rol.findByIdAndUpdate(
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

export default new RolRepository();