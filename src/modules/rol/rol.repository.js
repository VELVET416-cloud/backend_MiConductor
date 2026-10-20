// modules/roles/rol.repository.js

import Rol from "./rol.model.js";
import Usuario from "../usuario/usuario.model.js";

class RolRepository {

    async crear(datos) {

        return await Rol.create(datos);

    }

    async obtenerTodos() {

        const roles = await Rol.find({})
            .populate(
                "permisos",
                "nombre codigo modulo descripcion activo"
            )
            .sort({
                nombre: 1
            })
            .lean();

        const rolesConUsuarios = await Promise.all(

            roles.map(async (rol) => {

                const usuarios = await Usuario.countDocuments({
                    rol: rol._id,
                    estado: true
                });

                return {
                    ...rol,
                    usuariosAsignados: usuarios
                };

            })

        );

        return rolesConUsuarios;

    }

    async obtenerPorId(id) {

        const rol = await Rol.findOne({
            _id: id
        })
            .populate(
                "permisos",
                "nombre codigo modulo descripcion activo"
            )
            .lean();

        if (!rol) {
            return null;
        }

        const usuarios = await Usuario.countDocuments({
            rol: rol._id,
            estado: true
        });

        return {
            ...rol,
            usuariosAsignados: usuarios
        };

    }


    async obtenerPorNombre(nombre) {

        return await Rol.findOne({
            nombre
        });

    }



    async actualizar(id, datos) {

        return await Rol.findOneAndUpdate(
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
                "permisos",
                "nombre codigo modulo descripcion activo"
            );

    }



    async eliminar(id) {

        return await Rol.findByIdAndUpdate(
            id,
            {
                activo: false
            },
            {
                new: true,
                runValidators: true
            }
        );

    }

}


export default new RolRepository();