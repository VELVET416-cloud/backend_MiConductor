import mongoose from "mongoose";
import Permiso from "../modules/permiso/permiso.model.js";

export const seedPermisos = async () => {
    if (mongoose.connection.readyState !== 1) {
        console.log("⚠ Se omite el seed de permisos porque no hay conexión a MongoDB.");
        return;
    }

    const acciones = [
        "crear",
        "ver",
        "editar",
        "eliminar"
    ];

    const modulos = [
        "roles",
        "permisos",
        "usuarios",
        "conductores"
    ];

    const permisos = [];

    for (const modulo of modulos) {

        const nombreModulo =
            modulo.charAt(0).toUpperCase() + modulo.slice(1);

        for (const accion of acciones) {

            const nombreAccion =
                accion.charAt(0).toUpperCase() + accion.slice(1);

            permisos.push({

                nombre: `${nombreAccion} ${nombreModulo}`,

                codigo: `${modulo}.${accion}`,

                modulo: nombreModulo,

                descripcion: `Permite ${accion} ${modulo}.`

            });

        }

    }

    for (const permiso of permisos) {

        const existe = await Permiso.findOne({
            codigo: permiso.codigo
        });

        if (!existe) {

            await Permiso.create(permiso);

            console.log(`✅ Permiso ${permiso.codigo} creado.`);

        } else {

            console.log(`✔ Permiso ${permiso.codigo} ya existe.`);

        }

    }

    console.log("✔ Seed de permisos verificado.");

};