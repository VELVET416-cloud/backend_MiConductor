import Conductor from "./conductor.model.js";

class ConductorRepository {

    async crear(datosConductor) {

        return await Conductor.create(
            datosConductor
        );
    }

    async obtenerTodos() {

        return await Conductor.find({})
            .populate(
                "usuario",
                "nombre apellido tipoDocumento documento correo telefono estado"
            )
            .sort({
                createdAt: -1
            });
    }

    async obtenerDisponibles() {

        return await Conductor.find({
            disponible: true
        })
            .populate(
                "usuario",
                "nombre apellido tipoDocumento documento correo telefono estado"
            )
            .sort({
                createdAt: -1
            });
    }

    async obtenerPorId(id) {

        return await Conductor.findOne({
            _id: id
        })
            .populate(
                "usuario",
                "nombre apellido tipoDocumento documento correo telefono estado"
            );
    }

    async obtenerPorUsuario(usuarioId) {

        return await Conductor.findOne({
            usuario: usuarioId
        })
            .populate(
                "usuario",
                "nombre apellido tipoDocumento documento correo telefono estado"
            );
    }

    async obtenerPorLicencia(licencia) {

        return await Conductor.findOne({
            licencia
        });
    }

    async actualizarDisponibilidad(
        id,
        disponible
    ) {

        return await Conductor.findOneAndUpdate(
            {
                _id: id
            },
            {
                disponible
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate(
                "usuario",
                "nombre apellido tipoDocumento documento correo telefono estado"
            );
    }

    async cambiarDisponibilidad(
        id,
        disponible
    ) {

        return await this.actualizarDisponibilidad(
            id,
            disponible
        );
    }

    async actualizar(
        id,
        datosConductor
    ) {

        return await Conductor.findOneAndUpdate(
            {
                _id: id
            },
            datosConductor,
            {
                new: true,
                runValidators: true
            }
        )
            .populate(
                "usuario",
                "nombre apellido tipoDocumento documento correo telefono estado"
            );
    }

    async actualizarLicencia(
        id,
        datos
    ) {

        return await Conductor.findOneAndUpdate(
            {
                _id: id
            },
            datos,
            {
                new: true,
                runValidators: true
            }
        )
            .populate(
                "usuario",
                "nombre apellido tipoDocumento documento correo telefono estado"
            );
    }

    async eliminar(id) {

        return await Conductor.findOneAndDelete({
            _id: id
        });
    }

    async eliminarPorUsuario(usuarioId) {

        return await Conductor.findOneAndDelete({
            usuario: usuarioId
        });
    }
}

export default new ConductorRepository();