import Permiso from "../modules/permiso/permiso.model.js";

export const seedPermisos = async () => {

    const permisos = [

        // Roles
        {
            nombre: "Crear Rol",
            codigo: "roles.crear",
            modulo: "Roles",
            descripcion: "Permite crear nuevos roles."
        },
        {
            nombre: "Editar Rol",
            codigo: "roles.editar",
            modulo: "Roles",
            descripcion: "Permite editar roles."
        },
        {
            nombre: "Eliminar Rol",
            codigo: "roles.eliminar",
            modulo: "Roles",
            descripcion: "Permite eliminar roles."
        },
        {
            nombre: "Ver Roles",
            codigo: "roles.ver",
            modulo: "Roles",
            descripcion: "Permite consultar roles."
        },

        // Permisos
        {
            nombre: "Crear Permiso",
            codigo: "permisos.crear",
            modulo: "Permisos",
            descripcion: "Permite crear permisos."
        },
        {
            nombre: "Editar Permiso",
            codigo: "permisos.editar",
            modulo: "Permisos",
            descripcion: "Permite editar permisos."
        },
        {
            nombre: "Eliminar Permiso",
            codigo: "permisos.eliminar",
            modulo: "Permisos",
            descripcion: "Permite eliminar permisos."
        },
        {
            nombre: "Ver Permisos",
            codigo: "permisos.ver",
            modulo: "Permisos",
            descripcion: "Permite consultar permisos."
        }

    ];

    for (const permiso of permisos) {

        const existe = await Permiso.findOne({
            codigo: permiso.codigo
        });

        if (!existe) {

            await Permiso.create(permiso);

            console.log(`✅ Permiso ${permiso.codigo} creado.`);

        }

    }

    console.log("✔ Seed de permisos verificado.");

};