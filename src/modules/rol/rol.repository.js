// modules/roles/rol.repository.js

import Rol from "./rol.model.js";
import Usuario from "../usuario/usuario.model.js";

class RolRepository {

    async crear(datos) {

        const rolCreado = await Rol.create(datos);
        return await Rol.findById(rolCreado._id)
            .populate({
                path: "permisos",
                select: "nombre codigo modulo descripcion activo",
                match: { activo: true }
            });

    }

    async obtenerTodos() {

        const roles = await Rol.find({})
            .populate({
                path: "permisos",
                select: "nombre codigo modulo descripcion activo",
                match: { activo: true }
            })
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
            .populate({
                path: "permisos",
                select: "nombre codigo modulo descripcion activo",
                match: { activo: true }
            })
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
            .populate({
                path: "permisos",
                select: "nombre codigo modulo descripcion activo",
                match: { activo: true }
            });

    }



    async eliminar(id) {

        return await Rol.findByIdAndDelete(id);

    }

}


export default new RolRepository();