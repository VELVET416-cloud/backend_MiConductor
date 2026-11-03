import mongoose from "mongoose";
import UsuarioRepository from "./usuario.repository.js";
import UsuarioHelper from "./usuario.helper.js";
import AppError from "../../utils/AppError.js";
import EmailService from "../auth/email.service.js";
import ConductorRepository from "../conductor/conductor.repository.js";
import ClienteRepository from "../cliente/cliente.repository.js";

class UsuarioService {

    async crear(datos) {
        const usuario = await UsuarioHelper.crear(datos);

        // Enviar correo de activación de cuenta con token seguro
        try {
            const nombre = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || usuario.nombreCompleto || "Usuario";
            await EmailService.enviarCorreoActivacion(
                usuario.correo,
                nombre,
                usuario.activationToken
            );
        } catch (mailErr) {
            console.error("[UsuarioService] Error enviando correo de activación:", mailErr.message);
        }

        return usuario;
    }

    async obtenerTodos() {
        return await UsuarioRepository.obtenerTodos();
    }

    async obtenerPorId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }
        const usuario = await UsuarioRepository.obtenerPorId(id);
        if (!usuario) {
            throw new AppError("Usuario no encontrado.", 404);
        }
        return usuario;
    }

    async actualizar(id, datos) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }
        return await UsuarioHelper.actualizar(id, datos);
    }

    async eliminar(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }

        const usuario = await UsuarioRepository.obtenerPorId(id);
        if (!usuario) {
            throw new AppError("Usuario no encontrado.", 404);
        }

        // Verificar si tiene dependencias asociadas en Conductor
        try {
            const conductor = await ConductorRepository.obtenerPorUsuario(id);
            if (conductor) {
                throw new AppError(
                    "No se puede eliminar permanentemente este usuario porque tiene un perfil de Conductor asociado. Desactiva su cuenta en lugar de eliminarla para preservar el historial.",
                    400
                );
            }
        } catch (e) {
            if (e.statusCode === 400) throw e;
        }

        // Verificar si tiene dependencias asociadas en Cliente
        try {
            const cliente = await ClienteRepository.obtenerPorUsuario(id);
            if (cliente) {
                throw new AppError(
                    "No se puede eliminar permanentemente este usuario porque tiene un perfil de Cliente asociado. Desactiva su cuenta en lugar de eliminarla para preservar el historial.",
                    400
                );
            }
        } catch (e) {
            if (e.statusCode === 400) throw e;
        }

        // Eliminación física real en MongoDB
        await UsuarioRepository.eliminarFisico(id);
        return true;
    }
}

export default new UsuarioService();
