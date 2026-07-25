import Rol from "../modules/rol/rol.model.js";
import Permiso from "../modules/permiso/permiso.model.js";
import {
    ROLES,
    ACCIONES,
    MODULOS
} from "../constants/permiso.js";

export const seedRoles = async () => {

    // Obtener todos los permisos
    const todosLosPermisos = await Permiso.find();

    // Función para obtener los IDs de permisos por código
    const obtenerPermisos = (...codigos) => {

        return todosLosPermisos
            .filter(permiso =>
                codigos.includes(permiso.codigo)
            )
            .map(permiso => permiso._id);

    };

    const roles = [

        {
            nombre: ROLES.ADMIN,
            descripcion: "Administrador general del sistema.",

            // El administrador siempre tiene TODOS
            permisos: todosLosPermisos.map(
                permiso => permiso._id
            ),

            esSistema: true
        },

        {
            nombre: ROLES.CONDUCTOR,
            descripcion: "Conductor del sistema.",

            permisos: obtenerPermisos(

                `${ACCIONES.VER}.${MODULOS.CONDUCTORES}`,
                `${ACCIONES.EDITAR}.${MODULOS.CONDUCTORES}`

            ),

            esSistema: true
        },

        {
            nombre: ROLES.CLIENTE,
            descripcion: "Cliente del sistema.",

            permisos: [

                // Agrega aquí los permisos del cliente
                // Ejemplo:
                // ...obtenerPermisos(
                //     `${ACCIONES.VER}.${MODULOS.CONDUCTORES}`
                // )

            ],

            esSistema: true
        }

    ];

    for (const datosRol of roles) {

        let rol = await Rol.findOne({
            nombre: datosRol.nombre
        });

        if (!rol) {

            await Rol.create({
                ...datosRol,
                activo: true
            });

            console.log(
                `✅ Rol ${datosRol.nombre} creado.`
            );

        } else {

            rol.descripcion = datosRol.descripcion;
            rol.permisos = datosRol.permisos;
            rol.esSistema = true;
            rol.activo = true;

            await rol.save();

            console.log(
                `♻ Rol ${datosRol.nombre} actualizado.`
            );

        }

    }

    console.log("✔ Seed de roles verificado.");

};