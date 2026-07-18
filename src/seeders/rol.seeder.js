import Rol from "../modules/rol/rol.model.js";
import Permiso from "../modules/permiso/permiso.model.js";

export const seedRoles = async () => {

    // Obtener todos los permisos existentes
    const permisos = await Permiso.find({}, "_id");

    // Buscar el rol ADMINISTRADOR
    let administrador = await Rol.findOne({
        nombre: "ADMINISTRADOR"
    });

    // Si no existe, crearlo
    if (!administrador) {

        administrador = await Rol.create({
            nombre: "ADMINISTRADOR",
            descripcion: "Administrador general del sistema",
            permisos: permisos.map((permiso) => permiso._id),
            esSistema: true
        });

        console.log("✅ Rol ADMINISTRADOR creado correctamente.");

    } else {

        // Actualizar permisos
        administrador.permisos = permisos.map((permiso) => permiso._id);

        // Marcar como rol del sistema
        administrador.esSistema = true;

        await administrador.save();

        console.log("✅ Rol ADMINISTRADOR actualizado correctamente.");

    }

    console.log("✔ Seed de roles verificado.");

};