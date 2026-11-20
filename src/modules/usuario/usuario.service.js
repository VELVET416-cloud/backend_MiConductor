import mongoose from "mongoose";
import UsuarioRepository from "./usuario.repository.js";
import UsuarioHelper from "./usuario.helper.js";
import ClienteRepository from "../cliente/cliente.repository.js";
import VehiculoRepository from "../vehiculo/vehiculo.repository.js";
import AppError from "../../utils/AppError.js";
import EmailService from "../auth/email.service.js";
import ConductorRepository from "../conductor/conductor.repository.js";

class UsuarioService {

    async crear(datos) {
        const usuario = await UsuarioHelper.crear(datos);
        // Enviar correo de activación de cuenta en segundo plano (asíncrono) para evitar bloqueos/timeouts en el cliente
        const nombreActivacion = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || usuario.nombreCompleto || "Usuario";
        EmailService.enviarCorreoActivacion(
            usuario.correo,
            nombreActivacion,
            usuario.activationToken
        ).catch((mailErr) => {
            console.error("[UsuarioService] Error enviando correo de activación:", mailErr.message);
        });

        return usuario;
    }

    async obtenerTodos() {
        return await UsuarioRepository.obtenerTodos();
    }

    // Consultar usuario por documento (público / sanitizado), incluyendo sus vehículos
    async consultarPorDocumento(documento, tipoDocumento) {
        if (!documento || !documento.toString().trim()) {
            throw new AppError("El número de documento es obligatorio.", 400);
        }

        const usuario = await UsuarioRepository.obtenerPorDocumento(
            documento.toString().trim(),
            tipoDocumento ? tipoDocumento.toString().trim() : undefined
        );

        if (!usuario) {
            return {
                existe: false,
                datos: null
            };
        }

        // Consultar cliente y vehículos asociados a este usuario si existen
        let vehiculoPrincipal = null;
        let vehiculosMapeados = [];

        try {
            const cliente = await ClienteRepository.obtenerPorUsuario(usuario._id);
            if (cliente) {
                const vehiculos = await VehiculoRepository.obtenerPorCliente(cliente._id);
                if (Array.isArray(vehiculos) && vehiculos.length > 0) {
                    vehiculosMapeados = vehiculos.map(v => {
                        const fotos = Array.isArray(v.fotos) ? v.fotos : [];
                        return {
                            id: v._id,
                            marca: v.marca || "",
                            modelo: v.modelo || "",
                            anio: v.anio || null,
                            placa: v.placa || "",
                            color: v.color || "",
                            tipoVehiculo: v.tipoVehiculo || "",
                            tarjetaPropiedad: v.tarjetaPropiedad || (fotos[0] || null),
                            soat: v.certificadoSoat || v.seguro || (fotos[1] || null),
                            tecnomecanica: v.certificadoTecnicoMecanica || v.verificacion || (fotos[2] || null)
                        };
                    });
                    vehiculoPrincipal = vehiculosMapeados[0];
                }
            }
        } catch (error) {
            // No bloquear la respuesta de la persona si ocurre error al obtener vehículos
            console.error("Error al obtener vehículos del usuario:", error);
        }

        return {
            existe: true,
            datos: {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                nombreCompleto: `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim(),
                tipoDocumento: usuario.tipoDocumento,
                documento: usuario.documento,
                telefono: usuario.telefono || "",
                correo: usuario.correo || "",
                vehiculo: vehiculoPrincipal,
                vehiculos: vehiculosMapeados
            }
        };
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

    async eliminar(id, currentUserId = null) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El id del usuario no es válido.", 400);
        }

        if (currentUserId && id.toString() === currentUserId.toString()) {
            throw new AppError(
                "No puedes eliminar la cuenta con la que has iniciado sesión actualmente.",
                400
            );
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
