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

        const salt =
            await bcrypt.genSalt(10);

        datos.password =
            await bcrypt.hash(
                datos.password,
                salt
            );



        return await UsuarioRepository.crear(
            datos
        );
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

        return await UsuarioRepository.eliminar(id);

    }

    async eliminarFisico(id) {
        return await UsuarioRepository.eliminarFisico(id);
    }
}

export default new UsuarioHelper();
