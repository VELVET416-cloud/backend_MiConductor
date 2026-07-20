import bcrypt from "bcrypt";
import mongoose from "mongoose";

import UsuarioRepository from "./usuario.repository.js";
import RolRepository from "../rol/rol.repository.js";
import AppError from "../../utils/AppError.js";

class UsuarioService {

    // Crear usuario
    async crear(datos) {

        // Normalizar datos
        datos.nombre = datos.nombre.trim();
        datos.apellido = datos.apellido.trim();
        datos.tipoDocumento = datos.tipoDocumento.trim().toUpperCase();
        datos.documento = datos.documento.trim();
        datos.correo = datos.correo.trim().toLowerCase();
        datos.telefono = datos.telefono.trim();

        // Validar documento duplicado
        const documentoExiste = await UsuarioRepository.obtenerPorDocumento(
            datos.documento
        );

        if (documentoExiste) {
            throw new AppError(
                "Ya existe un usuario con ese documento.",
                409
            );
        }

        // Validar correo duplicado
        const correoExiste = await UsuarioRepository.obtenerPorCorreo(
            datos.correo
        );

        if (correoExiste) {
            throw new AppError(
                "Ya existe un usuario con ese correo.",
                409
            );
        }

        // Validar ID del rol
        if (!mongoose.Types.ObjectId.isValid(datos.rol)) {
            throw new AppError(
                "El rol enviado no es válido.",
                400
            );
        }

        // Validar existencia del rol
        const rol = await RolRepository.obtenerPorId(datos.rol);

        if (!rol) {
            throw new AppError(
                "El rol no existe.",
                404
            );
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);

        datos.password = await bcrypt.hash(
            datos.password,
            salt
        );

        return await UsuarioRepository.crear(datos);
    }

    // Obtener todos
    async obtenerTodos() {

        return await UsuarioRepository.obtenerTodos();

    }

    // Obtener por ID
    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del usuario no es válido.",
                400
            );
        }

        const usuario = await UsuarioRepository.obtenerPorId(id);

        if (!usuario) {
            throw new AppError(
                "Usuario no encontrado.",
                404
            );
        }

        return usuario;
    }

    // Actualizar usuario
    async actualizar(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del usuario no es válido.",
                400
            );
        }

        const usuario = await UsuarioRepository.obtenerPorId(id);

        if (!usuario) {
            throw new AppError(
                "Usuario no encontrado.",
                404
            );
        }

        // Normalizar datos
        if (datos.nombre)
            datos.nombre = datos.nombre.trim();

        if (datos.apellido)
            datos.apellido = datos.apellido.trim();

        if (datos.tipoDocumento)
            datos.tipoDocumento = datos.tipoDocumento.trim().toUpperCase();

        if (datos.documento)
            datos.documento = datos.documento.trim();

        if (datos.correo)
            datos.correo = datos.correo.trim().toLowerCase();

        if (datos.telefono)
            datos.telefono = datos.telefono.trim();

        // Validar documento
        if (
            datos.documento &&
            datos.documento !== usuario.documento
        ) {

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

        }

        // Validar correo
        if (
            datos.correo &&
            datos.correo !== usuario.correo
        ) {

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

        }

        // Validar rol
        if (datos.rol) {

            if (!mongoose.Types.ObjectId.isValid(datos.rol)) {
                throw new AppError(
                    "El rol enviado no es válido.",
                    400
                );
            }

            const rol = await RolRepository.obtenerPorId(datos.rol);

            if (!rol) {
                throw new AppError(
                    "El rol no existe.",
                    404
                );
            }

        }

        // Encriptar nueva contraseña
        if (datos.password) {

            const salt = await bcrypt.genSalt(10);

            datos.password = await bcrypt.hash(
                datos.password,
                salt
            );

        }

        return await UsuarioRepository.actualizar(
            id,
            datos
        );
    }

    // Eliminar usuario
    async eliminar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del usuario no es válido.",
                400
            );
        }

        const usuario = await UsuarioRepository.obtenerPorId(id);

        if (!usuario) {
            throw new AppError(
                "Usuario no encontrado.",
                404
            );
        }

        await UsuarioRepository.eliminar(id);

        return;
    }

}

export default new UsuarioService();