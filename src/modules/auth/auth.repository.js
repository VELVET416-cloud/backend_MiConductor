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

}

export default new AuthRepository();