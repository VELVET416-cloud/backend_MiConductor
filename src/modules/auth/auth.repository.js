import Usuario from "../usuario/usuario.model.js";

class AuthRepository {

    async obtenerPorCorreo(correo) {

        return await Usuario.findOne({
            correo,
            estado: true
        })
            .select("+password")
            .populate({
                path: "rol",
                select: "nombre permisos",
                populate: {
                    path: "permisos",
                    select: "codigo"
                }
            });

    }

    async obtenerPorId(id) {

        return await Usuario.findOne({
            _id: id,
            estado: true
        }).populate({
            path: "rol",
            select: "nombre permisos",
            populate: {
                path: "permisos",
                select: "codigo"
            }
        });

    }

    async guardarTokenRecuperacion(id, token, expiracion) {

        return await Usuario.findByIdAndUpdate(
            id,
            {
                resetPasswordToken: token,
                resetPasswordExpires: expiracion
            },
            {
                new: true
            }
        );

    }

    async obtenerPorTokenRecuperacion(token) {

        return await Usuario.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: new Date()
            },
            estado: true
        })
            .select("+password +resetPasswordToken +resetPasswordExpires");

    }

    async actualizarPassword(id, password) {

        return await Usuario.findByIdAndUpdate(
            id,
            {
                password,
                resetPasswordToken: null,
                resetPasswordExpires: null
            },
            {
                new: true
            }
        );

    }

}

export default new AuthRepository();