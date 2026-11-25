import crypto from "crypto";
import bcrypt from "bcrypt";

import UsuarioRepository from "./usuario.repository.js";
import RolRepository from "../rol/rol.repository.js";
import AppError from "../../utils/AppError.js";
import {
    normalizeTipoDocumento,
    normalizeDocumento,
    validateTipoDocumentoValue,
    validateDocumentoPorTipo
} from "../cliente/cliente.schema.js";

class UsuarioHelper {

    async crear(datos, nombreRol) {

        if (datos.nombreCompleto && (!datos.nombre || !datos.apellido)) {
            const parts = datos.nombreCompleto.trim().split(/\s+/);
            datos.nombre = parts[0] || "";
            datos.apellido = parts.slice(1).join(" ") || parts[0] || "";
        }

        datos.nombre =
            datos.nombre.trim();

        datos.apellido =
            datos.apellido.trim();

        datos.tipoDocumento =
            normalizeTipoDocumento(datos.tipoDocumento);

        datos.documento =
            normalizeDocumento(datos.documento, datos.tipoDocumento);

        const tipoError = validateTipoDocumentoValue(datos.tipoDocumento);
        if (tipoError) {
            throw new AppError(tipoError, 400);
        }

        const docError = validateDocumentoPorTipo(datos.documento, datos.tipoDocumento);
        if (docError) {
            throw new AppError(docError, 400);
        }

        datos.correo =
            datos.correo
                .trim()
                .toLowerCase();

        if (datos.fechaNacimiento) {
            datos.fechaNacimiento = new Date(datos.fechaNacimiento);
        }
        if (datos.edad !== undefined && datos.edad !== null && datos.edad !== "") {
            datos.edad = Number(datos.edad);
        }

        datos.telefono =
            datos.telefono.trim();


        const documentoExiste =
            await UsuarioRepository.obtenerPorDocumento(
                datos.documento,
                datos.tipoDocumento
            );

        if (documentoExiste) {

            throw new AppError(
                "Ya existe un usuario con ese documento.",
                409
            );

        }


        const correoExiste =
            await UsuarioRepository.obtenerPorCorreo(
                datos.correo
            );

        if (correoExiste) {

            throw new AppError(
                "Ya existe un usuario con ese correo.",
                409
            );

        }

        if (nombreRol) {
            const rol =
                await RolRepository.obtenerPorNombre(
                    nombreRol
                );

            if (!rol) {
                throw new AppError(
                    `El rol ${nombreRol} no existe.`,
                    404
                );
            }
            datos.rol = rol._id;
        } else if (!datos.rol) {
            throw new AppError(
                "No se proporcionó un rol para el usuario.",
                400
            );
        }

        let plainPasswordGenerada = null;

        if (!datos.password) {
            const token = crypto.randomBytes(32).toString("hex");
            datos.activationToken = token;
            datos.activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            datos.isActivated = false;

            // Generar una contraseña temporal legible y segura (ej: Mc*8F3a9B2!)
            const randomPart = crypto.randomBytes(4).toString("hex");
            plainPasswordGenerada = `Mc*${randomPart}!`;
            const salt = await bcrypt.genSalt(10);
            datos.password = await bcrypt.hash(plainPasswordGenerada, salt);
        } else {
            const salt = await bcrypt.genSalt(10);
            plainPasswordGenerada = datos.password;
            datos.password = await bcrypt.hash(datos.password, salt);
            datos.isActivated = true;
        }

        const usuarioCreado = await UsuarioRepository.crear(
            datos
        );

        if (usuarioCreado) {
            usuarioCreado.plainPassword = plainPasswordGenerada;
        }

        return usuarioCreado;
    }


    async actualizar(id, datos) {

        const usuario =
            await UsuarioRepository.obtenerPorId(id);

        if (!usuario) {

            throw new AppError(
                "Usuario no encontrado.",
                404
            );

        }

        const esObjetivoSuperAdmin =
            usuario.esSuperAdmin === true ||
            String(usuario.rol?.nombre || "").toUpperCase() === "SUPERADMINISTRADOR";

        if (esObjetivoSuperAdmin) {
            if (datos.estado === false) {
                throw new AppError(
                    "El usuario Superadministrador no puede ser desactivado.",
                    403
                );
            }
            if (datos.rol !== undefined) {
                const rolActualId = String(usuario.rol?._id || usuario.rol || "");
                if (String(datos.rol) !== rolActualId) {
                    throw new AppError(
                        "El rol del usuario Superadministrador no puede ser modificado.",
                        403
                    );
                }
            }
            delete datos.esSuperAdmin;
        }


        if (datos.nombre) {

            datos.nombre =
                datos.nombre.trim();

        }

        if (datos.apellido) {

            datos.apellido =
                datos.apellido.trim();

        }

        if (datos.tipoDocumento) {

            datos.tipoDocumento =
                normalizeTipoDocumento(datos.tipoDocumento);

            const tipoErr = validateTipoDocumentoValue(datos.tipoDocumento);
            if (tipoErr) {
                throw new AppError(tipoErr, 400);
            }

        }

        const tipoEfectivo = datos.tipoDocumento || usuario.tipoDocumento;

        if (datos.documento) {

            datos.documento =
                normalizeDocumento(datos.documento, tipoEfectivo);

            const docErr = validateDocumentoPorTipo(datos.documento, tipoEfectivo);
            if (docErr) {
                throw new AppError(docErr, 400);
            }

        } else if (datos.tipoDocumento && datos.tipoDocumento !== usuario.tipoDocumento) {
            const docErr = validateDocumentoPorTipo(usuario.documento, datos.tipoDocumento);
            if (docErr) {
                throw new AppError(docErr, 400);
            }
        }

        if (datos.correo) {

            datos.correo =
                datos.correo
                    .trim()
                    .toLowerCase();

        }

        if (datos.fechaNacimiento !== undefined) {
            datos.fechaNacimiento = datos.fechaNacimiento ? new Date(datos.fechaNacimiento) : null;
        }
        if (datos.edad !== undefined) {
            datos.edad = (datos.edad !== null && datos.edad !== "") ? Number(datos.edad) : null;
        }

        if (datos.telefono) {

            datos.telefono =
                datos.telefono.trim();

        }


        if (
            (datos.documento && datos.documento !== usuario.documento) ||
            (datos.tipoDocumento && datos.tipoDocumento !== usuario.tipoDocumento)
        ) {
            const docVerificar = datos.documento || usuario.documento;
            const existe =
                await UsuarioRepository.obtenerPorDocumento(
                    docVerificar,
                    tipoEfectivo
                );

            if (existe && existe._id.toString() !== usuario._id.toString()) {

                throw new AppError(
                    "Ya existe un usuario con ese documento.",
                    409
                );

            }
        }



        if (
            datos.correo &&
            datos.correo !== usuario.correo
        ) {

            const existe =
                await UsuarioRepository.obtenerPorCorreo(
                    datos.correo
                );

            if (existe) {

                throw new AppError(
                    "Ya existe un usuario con ese correo.",
                    409
                );

            }
        }


        if (datos.password) {

            const salt =
                await bcrypt.genSalt(10);

            datos.password =
                await bcrypt.hash(
                    datos.password,
                    salt
                );

        }


        return await UsuarioRepository.actualizar(
            id,
            datos
        );
    }

    async eliminar(id) {
        const usuario = await UsuarioRepository.obtenerPorId(id);
        if (
            usuario &&
            (usuario.esSuperAdmin === true ||
                String(usuario.rol?.nombre || "").toUpperCase() === "SUPERADMINISTRADOR")
        ) {
            throw new AppError(
                "El usuario Superadministrador está protegido y no puede ser desactivado.",
                403
            );
        }

        return await UsuarioRepository.eliminar(id);

    }

    async eliminarFisico(id) {
        const usuario = await UsuarioRepository.obtenerPorId(id);
        if (
            usuario &&
            (usuario.esSuperAdmin === true ||
                String(usuario.rol?.nombre || "").toUpperCase() === "SUPERADMINISTRADOR")
        ) {
            throw new AppError(
                "El usuario Superadministrador está protegido y no puede ser eliminado.",
                403
            );
        }

        return await UsuarioRepository.eliminarFisico(id);
    }
}

export default new UsuarioHelper();
