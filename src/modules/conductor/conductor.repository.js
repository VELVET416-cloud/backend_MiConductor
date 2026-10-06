import Conductor from "./conductor.model.js";

class ConductorRepository {


    async crear(datosConductor) {

        return await Conductor.create(
            datosConductor
        );

    }

    async obtenerTodos() {

        return await Conductor.find({
            estado: true
        })
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            })
            .sort({
                createdAt: -1
            });

    }

    async obtenerPorId(id) {

        return await Conductor.findOne({
            _id: id,
            estado: true
        })
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });

    }

    async obtenerPorUsuario(usuarioId) {

        return await Conductor.findOne({
            usuario: usuarioId,
            estado: true
        })
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });

    }

    async obtenerPorLicencia(licencia) {

        return await Conductor.findOne({
            licencia,
            estado: true
        });

    }

    async actualizar(id, datosConductor) {

        return await Conductor.findOneAndUpdate(
            {
                _id: id,
                estado: true
            },
            datosConductor,
            {
                new: true,
                runValidators: true
            }
        )
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });

    }


    async eliminar(id) {

        return await Conductor.findOneAndUpdate(
            {
                _id: id,
                estado: true
            },
            {
                estado: false
            },
            {
                new: true
            }
        );

    }

    async cambiarDisponibilidad(
        id,
        disponible
    ) {

        return await Conductor.findOneAndUpdate(
            {
                _id: id,
                estado: true
            },
            {
                disponible
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });

    }

    async obtenerDisponibles() {

        return await Conductor.find({
            estado: true,
            disponible: true
        })
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            })
            .sort({
                createdAt: -1
            });

    }

    async actualizarLicencia(
        id,
        datosLicencia
    ) {

        return await Conductor.findOneAndUpdate(
            {
                _id: id,
                estado: true
            },
            datosLicencia,
            {
                new: true,
                runValidators: true
            }
        )
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });

    }
}

export default new ConductorRepository();