// modules/roles/rol.repository.js

import Rol from "./rol.model.js";
import Usuario from "../usuario/usuario.model.js";

class RolRepository {

    /* =========================================================
       CREAR
    ========================================================= */

    async crear(datos) {

        return await Rol.create(datos);

    }


    /* =========================================================
       OBTENER TODOS
       
       Trae activos e inactivos.
       Además cuenta cuántos usuarios activos tiene cada rol.
    ========================================================= */

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


    /* =========================================================
       OBTENER POR ID
       
       Puede consultar tanto roles activos como inactivos.
    ========================================================= */

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


    /* =========================================================
       OBTENER POR NOMBRE
       
       Busca el rol independientemente de si está activo
       o inactivo.

       Esto evita intentar crear otro rol con el mismo nombre
       cuando ya existe uno inactivo.
    ========================================================= */

    async obtenerPorNombre(nombre) {

        return await Rol.findOne({
            nombre
        });

    }


    /* =========================================================
       ACTUALIZAR
       
       Permite cambiar:
       
       activo: true  → activo: false
       activo: false → activo: true
    ========================================================= */

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


    /* =========================================================
       ELIMINAR
       
       Eliminación lógica.
       
       El documento permanece en MongoDB.
       Solo cambia activo a false.
    ========================================================= */

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