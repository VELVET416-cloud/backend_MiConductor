import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { env } from "../config/env.js";
import { connectDB } from "../config/database.js";
import { seedPermisos } from "./permiso.seeder.js";
import { seedRoles } from "./rol.seeder.js";
import Rol from "../modules/rol/rol.model.js";
import Permiso from "../modules/permiso/permiso.model.js";
import Usuario from "../modules/usuario/usuario.model.js";
import { ROLES } from "../constants/permiso.js";
import { validateStrongPassword } from "../modules/cliente/cliente.schema.js";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function splitNombreCompleto(fullName, fallbackLastName = "") {
    const cleanFull = String(fullName || "").trim().replace(/\s+/g, " ");
    const cleanLast = String(fallbackLastName || "").trim();

    if (cleanLast) {
        return {
            nombre: cleanFull || "Super",
            apellido: cleanLast,
            nombreCompleto: `${cleanFull || "Super"} ${cleanLast}`.trim()
        };
    }

    const parts = cleanFull.split(" ").filter(Boolean);
    if (parts.length >= 2) {
        const nombre = parts[0];
        const apellido = parts.slice(1).join(" ");
        return { nombre, apellido, nombreCompleto: cleanFull };
    }

    return {
        nombre: parts[0] || "Super",
        apellido: "Administrador",
        nombreCompleto: `${parts[0] || "Super"} Administrador`.trim()
    };
}

export const seedSuperAdmin = async () => {
    // 1. Garantizar que existan todos los permisos y roles base (incluyendo SUPERADMINISTRADOR)
    await seedPermisos();
    await seedRoles();

    const todosLosPermisos = await Permiso.find({ activo: true }).select("_id");
    const permisoIds = todosLosPermisos.map((p) => p._id);

    // 2. Verificar / crear / sincronizar rol SUPERADMINISTRADOR
    let rolSuperAdmin = await Rol.findOne({ nombre: ROLES.SUPERADMIN });

    if (!rolSuperAdmin) {
        rolSuperAdmin = await Rol.create({
            nombre: ROLES.SUPERADMIN,
            descripcion: "Superadministrador del sistema con control total y protección permanente.",
            permisos: permisoIds,
            esSistema: true,
            activo: true
        });
        console.log(`✔ Rol ${ROLES.SUPERADMIN} creado con ${permisoIds.length} permisos.`);
    } else {
        rolSuperAdmin.permisos = permisoIds;
        rolSuperAdmin.esSistema = true;
        rolSuperAdmin.activo = true;
        await rolSuperAdmin.save();
        console.log(`✔ Rol ${ROLES.SUPERADMIN} verificado y sincronizado con ${permisoIds.length} permisos.`);
    }

    // 3. Leer y validar variables de entorno obligatorias
    const rawName = (process.env.SUPERADMIN_NAME || env.SUPERADMIN_NAME || "").trim();
    const rawLastName = (process.env.SUPERADMIN_LASTNAME || env.SUPERADMIN_LASTNAME || "").trim();
    const rawEmail = (process.env.SUPERADMIN_EMAIL || env.SUPERADMIN_EMAIL || "").trim().toLowerCase();
    const rawPassword = process.env.SUPERADMIN_PASSWORD || env.SUPERADMIN_PASSWORD || "";
    const rawDocument = (process.env.SUPERADMIN_DOCUMENT || env.SUPERADMIN_DOCUMENT || "9000000001").trim();
    const rawPhone = (process.env.SUPERADMIN_PHONE || env.SUPERADMIN_PHONE || "3000000000").trim();

    if (!rawName || !rawEmail || !rawPassword) {
        throw new Error(
            "Faltan variables de entorno obligatorias para el Superadministrador: SUPERADMIN_NAME, SUPERADMIN_EMAIL y SUPERADMIN_PASSWORD."
        );
    }

    if (!EMAIL_REGEX.test(rawEmail)) {
        throw new Error(`El correo SUPERADMIN_EMAIL ("${rawEmail}") no tiene un formato válido.`);
    }

    const pwdError = validateStrongPassword(rawPassword);
    if (pwdError) {
        throw new Error(`La contraseña SUPERADMIN_PASSWORD no cumple los requisitos de seguridad: ${pwdError}`);
    }

    // 4. Verificar si ya existe un usuario Superadministrador (idempotencia)
    const existente = await Usuario.findOne({
        $or: [
            { esSuperAdmin: true },
            { rol: rolSuperAdmin._id },
            { correo: rawEmail }
        ]
    }).populate("rol", "nombre");

    if (existente) {
        let actualizado = false;

        // No sobrescribir contraseña ni datos personales; solo garantizar integridad de rol/protección/estado activo
        if (String(existente.rol?._id || existente.rol) !== String(rolSuperAdmin._id)) {
            existente.rol = rolSuperAdmin._id;
            actualizado = true;
        }
        if (existente.esSuperAdmin !== true) {
            existente.esSuperAdmin = true;
            actualizado = true;
        }
        if (existente.estado !== true) {
            existente.estado = true;
            actualizado = true;
        }
        if (existente.isActivated !== true) {
            existente.isActivated = true;
            actualizado = true;
        }

        if (actualizado) {
            await existente.save();
            console.log(`♻ Usuario Superadministrador (${existente.correo}) verificado y protegido sin alterar sus datos personales ni contraseña.`);
        } else {
            console.log(`✔ Usuario Superadministrador ya existe (${existente.correo}). No se realizaron duplicados ni sobrescrituras.`);
        }

        return { rol: rolSuperAdmin, usuario: existente, created: false };
    }

    // 5. Crear el usuario Superadministrador con contraseña hasheada mediante bcrypt
    const { nombre, apellido, nombreCompleto } = splitNombreCompleto(rawName, rawLastName);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const nuevoSuperAdmin = await Usuario.create({
        nombre,
        apellido,
        nombreCompleto,
        tipoDocumento: "CC",
        documento: rawDocument,
        correo: rawEmail,
        telefono: rawPhone,
        password: passwordHash,
        isActivated: true,
        estado: true,
        esSuperAdmin: true,
        aceptaTerminos: true,
        fechaAceptacionTerminos: new Date(),
        rol: rolSuperAdmin._id
    });

    console.log(`✅ Usuario Superadministrador creado exitosamente (${nuevoSuperAdmin.correo}).`);

    return { rol: rolSuperAdmin, usuario: nuevoSuperAdmin, created: true };
};

// Ejecución directa desde CLI: npm run seed:superadmin
const currentFile = fileURLToPath(import.meta.url);
const executedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (path.resolve(currentFile) === executedFile) {
    (async () => {
        try {
            await connectDB();
            await seedSuperAdmin();
            await mongoose.connection.close();
            process.exit(0);
        } catch (error) {
            console.error("❌ Error ejecutando seed:superadmin:", error.message);
            try {
                await mongoose.connection.close();
            } catch {
                // ignore close errors
            }
            process.exit(1);
        }
    })();
}
