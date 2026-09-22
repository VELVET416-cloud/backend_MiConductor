import Permiso from "../modules/permiso/permiso.model.js";
import {
    ACCIONES,
    MODULOS
} from "../constants/permiso.js";

export const seedPermisos = async () => {

    const modulos = [

        {
            nombre: MODULOS.ROLES,
            acciones: [
                ACCIONES.CREAR,
                ACCIONES.VER,
                ACCIONES.EDITAR,
                ACCIONES.ELIMINAR
            ]
        },

        {
            nombre: MODULOS.PERMISOS,
            acciones: [
                ACCIONES.CREAR,
                ACCIONES.VER,
                ACCIONES.EDITAR,
                ACCIONES.ELIMINAR
            ]
        },

        {
            nombre: MODULOS.USUARIOS,
            acciones: [
                ACCIONES.CREAR,
                ACCIONES.VER,
                ACCIONES.EDITAR,
                ACCIONES.ELIMINAR
            ]
        },

        {
            nombre: MODULOS.CONDUCTORES,
            acciones: [
                ACCIONES.CREAR,
                ACCIONES.VER,
                ACCIONES.EDITAR,
                ACCIONES.ELIMINAR
            ]
        },

        {
            nombre: MODULOS.NOVEDADES,
            acciones: [
                ACCIONES.CREAR,
                ACCIONES.VER,
                ACCIONES.EDITAR,
                ACCIONES.ELIMINAR
            ]
        },

        {
            nombre: MODULOS.VEHICULOS,
            acciones: [
                ACCIONES.CREAR,
                ACCIONES.VER,
                ACCIONES.EDITAR,
                ACCIONES.ELIMINAR
            ]
        }

    ];

    const permisos = [];

    for (const modulo of modulos) {

        const nombreModulo =
            modulo.nombre.charAt(0).toUpperCase() +
            modulo.nombre.slice(1);

        for (const accion of modulo.acciones) {

            const nombreAccion =
                accion.charAt(0).toUpperCase() +
                accion.slice(1);

            permisos.push({

                nombre: `${nombreAccion} ${nombreModulo}`,

                codigo: `${accion}.${modulo.nombre}`,

                modulo: nombreModulo,

                descripcion: `Permite ${accion} ${modulo.nombre}.`,

                activo: true

            });

        }

    }

    for (const permiso of permisos) {

        const existe = await Permiso.findOne({
            codigo: permiso.codigo
        });

        if (!existe) {

            await Permiso.create(permiso);

            console.log(
                `✅ Permiso ${permiso.codigo} creado.`
            );

        } else {

            await Permiso.updateOne(
                { codigo: permiso.codigo },
                permiso
            );

            console.log(
                `♻ Permiso ${permiso.codigo} actualizado.`
            );

        }

    }

    console.log("✔ Seed de permisos verificado.");

};