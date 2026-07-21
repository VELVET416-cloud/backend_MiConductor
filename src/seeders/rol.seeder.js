import Rol from "../modules/rol/rol.model.js";
import Permiso from "../modules/permiso/permiso.model.js";

export const seedRoles = async () => {

    // Obtener todos los permisos existentes
    const todosLosPermisos = await Permiso.find({}, "_id");

    const roles = [

        {
            nombre: "ADMINISTRADOR",
            descripcion: "Administrador general del sistema.",
            permisos: todosLosPermisos.map(
                permiso => permiso._id
            ),
            esSistema: true
        },

        {
            nombre: "CONDUCTOR",
            descripcion: "Conductor del sistema.",
            permisos: [],
            esSistema: true
        },

        {
            nombre: "CLIENTE",
            descripcion: "Cliente del sistema.",
            permisos: [],
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