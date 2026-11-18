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
                select: "nombre descripcion activo esSistema permisos",
                populate: {
                    path: "permisos",
                    select: "nombre codigo modulo activo",
                    match: { activo: true }
                }
            });

    }

    async obtenerPorId(id) {

        return await Usuario.findOne({
            _id: id,
            estado: true
        }).populate({
            path: "rol",
            select: "nombre descripcion activo esSistema permisos",
            populate: {
                path: "permisos",
                select: "nombre codigo modulo activo",
                match: { activo: true }
            }
        });

    }

    async obtenerPorIdConPassword(id) {

        return await Usuario.findOne({
            _id: id,
            estado: true
        })
            .select("+password")
            .populate({
                path: "rol",
                select: "nombre descripcion activo esSistema permisos",
                populate: {
                    path: "permisos",
                    select: "nombre codigo modulo activo",
                    match: { activo: true }
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


    async obtenerPorTokenActivacion(token) {
        return await Usuario.findOne({
            activationToken: token,
            activationTokenExpires: {
                $gt: new Date()
            }
        })
            .select("+password +activationToken +activationTokenExpires")
            .populate("rol", "nombre");
    }

    async activarCuenta(id, passwordHash) {
        return await Usuario.findByIdAndUpdate(
            id,
            {
                password: passwordHash,
                isActivated: true,
                estado: true,
                activationToken: null,
                activationTokenExpires: null
            },
            {
                new: true
            }
        );
    }
}

export default new AuthRepository();
