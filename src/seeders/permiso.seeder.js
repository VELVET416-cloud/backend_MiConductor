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
        },

        // Vehículos
        {
            nombre: "Crear Vehículo",
            codigo: "vehiculos.crear",
            modulo: "Vehículos",
            descripcion: "Permite crear nuevos vehículos."
        },
        {
            nombre: "Editar Vehículo",
            codigo: "vehiculos.editar",
            modulo: "Vehículos",
            descripcion: "Permite editar vehículos."
        },
        {
            nombre: "Eliminar Vehículo",
            codigo: "vehiculos.eliminar",
            modulo: "Vehículos",
            descripcion: "Permite eliminar vehículos."
        },
        {
            nombre: "Ver Vehículos",
            codigo: "vehiculos.ver",
            modulo: "Vehículos",
            descripcion: "Permite consultar vehículos."
        },

        // Novedades
        {
            nombre: "Crear Novedad",
            codigo: "novedades.crear",
            modulo: "Novedades",
            descripcion: "Permite crear nuevas novedades."
        },
        {
            nombre: "Editar Novedad",
            codigo: "novedades.editar",
            modulo: "Novedades",
            descripcion: "Permite editar novedades."
        },
        {
            nombre: "Eliminar Novedad",
            codigo: "novedades.eliminar",
            modulo: "Novedades",
            descripcion: "Permite eliminar novedades."
        },
        {
            nombre: "Ver Novedades",
            codigo: "novedades.ver",
            modulo: "Novedades",
            descripcion: "Permite consultar novedades."
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