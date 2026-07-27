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
                populate: {
                    path: "permisos"
                }
            });

    }

}

export default new AuthRepository();