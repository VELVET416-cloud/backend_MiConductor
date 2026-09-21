import bcrypt from "bcrypt";

import UsuarioRepository from "./usuario.repository.js";

import RolRepository from "../rol/rol.repository.js";

import AppError from "../../utils/AppError.js";

class UsuarioHelper {

    // Crear usuario
    async crear(datos) {

        // Limpiar datos
        datos.nombre =
            datos.nombre.trim();

        datos.apellido =
            datos.apellido.trim();

        datos.tipoDocumento =
            datos.tipoDocumento
                .trim()
                .toUpperCase();

        datos.documento =
            datos.documento.trim();

        datos.correo =
            datos.correo
                .trim()
                .toLowerCase();

        datos.telefono =
            datos.telefono.trim();


        const documentoExiste =
            await UsuarioRepository.obtenerPorDocumento(
                datos.documento
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


        if (!datos.rol) {

            throw new AppError(
                "El rol es obligatorio.",
                400
            );
        }

        if (!datos.rol) {
            throw new AppError(
                "El rol es obligatorio.",
                400
            );
        }

        const rol =
            await RolRepository.obtenerPorId(
                datos.rol
            );

        if (!rol) {
            throw new AppError(
                "El rol seleccionado no existe.",
                404
            );
        }

        datos.rol = rol._id;


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


        // Nombre
        if (datos.nombre) {

            datos.nombre =
                datos.nombre.trim();
        }


        // Apellido
        if (datos.apellido) {

            datos.apellido =
                datos.apellido.trim();
        }


        // Tipo de documento
        if (datos.tipoDocumento) {

            datos.tipoDocumento =
                datos.tipoDocumento
                    .trim()
                    .toUpperCase();
        }


        // Documento
        if (datos.documento) {

            datos.documento =
                datos.documento.trim();
        }


        // Correo
        if (datos.correo) {

            datos.correo =
                datos.correo
                    .trim()
                    .toLowerCase();
        }


        // Teléfono
        if (datos.telefono) {

            datos.telefono =
                datos.telefono.trim();
        }



        if (
            datos.documento &&
            datos.documento !== usuario.documento
        ) {

            const existe =
                await UsuarioRepository.obtenerPorDocumento(
                    datos.documento
                );

            if (existe) {

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



        if (datos.rol) {

            const rol =
                await RolRepository.obtenerPorId(
                    datos.rol
                );

            if (!rol) {

                throw new AppError(
                    "El rol seleccionado no existe.",
                    404
                );
            }

            datos.rol = rol._id;
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

        return await UsuarioRepository.eliminar(
            id
        );
    }
}

export default new UsuarioHelper();