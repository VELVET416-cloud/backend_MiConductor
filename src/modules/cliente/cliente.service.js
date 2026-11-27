import EmailService from "../auth/email.service.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { env } from "../../config/env.js";

import ClienteRepository from "./cliente.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import UsuarioHelper from "../usuario/usuario.helper.js";
import AppError from "../../utils/AppError.js";
import RolRepository from "../rol/rol.repository.js";
import VehiculoRepository from "../vehiculo/vehiculo.repository.js";
import SolicitudRepository from "../solicitud/solicitud.repository.js";
import {
    validarDatosCliente,
    validarPasswordActivacionCliente
} from "./cliente.validation.js";

class ClienteService {

    // ======================================================
    // CREAR CLIENTE
    // ======================================================

    async crear(datos, { autoRegistro = false } = {}) {
        validarDatosCliente(datos, { esActualizacion: false });
        datos.direccion = (datos.direccion || "").toString().trim();

        if (autoRegistro) {
            if (datos.aceptaTerminos !== true) {
                throw new AppError(
                    "Debes aceptar los términos y condiciones y la política de tratamiento de datos personales.",
                    400
                );
            }
            if (!datos.password || typeof datos.password !== "string") {
                throw new AppError("La contraseña es obligatoria.", 400);
            }
        }

        // Validar que el documento y correo no estén repetidos consultando los datos existentes
        const docExistente = await UsuarioRepository.obtenerPorDocumento(datos.documento);
        if (docExistente) {
            throw new AppError("El número de documento ya se encuentra registrado.", 409);
        }

        const correoExistente = await UsuarioRepository.obtenerPorCorreo(datos.correo);
        if (correoExistente) {
            throw new AppError("El correo electrónico ya se encuentra registrado.", 409);
        }

        // Buscar el rol CLIENTE
        let rolClienteId = datos.rol || datos.rolId;

        if (!rolClienteId) {
            let rolCliente = await RolRepository.obtenerPorNombre("CLIENTE");
            if (!rolCliente) rolCliente = await RolRepository.obtenerPorNombre("CLIENTES");
            if (!rolCliente) rolCliente = await RolRepository.obtenerPorNombre("Cliente");

            if (!rolCliente) {
                throw new AppError(
                    "El rol CLIENTE no está configurado.",
                    500
                );
            }
            rolClienteId = rolCliente._id;
        }

        const aceptaTerminos = Boolean(datos.aceptaTerminos);
        const fechaAceptacionTerminos = aceptaTerminos
            ? (datos.fechaAceptacionTerminos ? new Date(datos.fechaAceptacionTerminos) : new Date())
            : null;

        // Si es auto-registro (web o móvil), se envía la contraseña del usuario para hashearla con bcrypt.
        // Si es creación por administrador, no enviamos password para que UsuarioHelper genere activationToken.
        const payloadUsuario = {
            nombre: datos.nombre,
            apellido: datos.apellido,
            nombreCompleto: datos.nombreCompleto || `${datos.nombre || ""} ${datos.apellido || ""}`.trim(),
            tipoDocumento: datos.tipoDocumento,
            documento: datos.documento,
            correo: datos.correo,
            telefono: datos.telefono,
            foto: datos.foto || null,
            fechaNacimiento: datos.fechaNacimiento || null,
            edad: datos.edad || null,
            aceptaTerminos,
            fechaAceptacionTerminos,
            rol: rolClienteId
        };

        if (autoRegistro && datos.password) {
            payloadUsuario.password = datos.password;
        }

        const usuario = await UsuarioHelper.crear(payloadUsuario);

        try {
            // Crear registro de Cliente con referencia al usuario creado
            const cliente = await ClienteRepository.crear({
                usuario: usuario._id,
                direccion: datos.direccion,
                foto: datos.foto || null,
                fechaNacimiento: datos.fechaNacimiento || null,
                edad: datos.edad || null,
                aceptaTerminos,
                fechaAceptacionTerminos
            });

            // Solo enviar correo de activación cuando el cliente es creado por un administrador (sin contraseña propia)
            if (!autoRegistro) {
                // Recargar variables de entorno de correo por si el servidor inició antes de actualizar .env
                dotenv.config({ override: true });
                if (process.env.MAIL_USER) env.MAIL_USER = process.env.MAIL_USER;
                if (process.env.MAIL_PASSWORD) env.MAIL_PASSWORD = process.env.MAIL_PASSWORD;
                if (process.env.MAIL_HOST) env.MAIL_HOST = process.env.MAIL_HOST;
                if (process.env.MAIL_PORT) env.MAIL_PORT = process.env.MAIL_PORT;
                if (process.env.CLIENT_URL) env.CLIENT_URL = process.env.CLIENT_URL;

                // Apuntar el enlace de activación del cliente a /api/clientes/activar-cuenta
                // para que funcione directamente en el navegador aunque el Administrador tenga sesión abierta.
                const port = process.env.PORT || env.PORT || 3000;
                const baseUrlActivacion = `http://localhost:${port}/api/clientes`;

                // Generar un token JWT firmado con expiración estricta de 10 minutos (claim "exp")
                // y de un solo uso vinculado a activationToken y activationTokenExpires (10 minutos) en base de datos
                const diezMinutosMs = 10 * 60 * 1000;
                const expiracion10Min = new Date(Date.now() + diezMinutosMs);
                const secret = process.env.JWT_SECRET || env.JWT_SECRET || "mi_conductor_secret";

                const signedActivationToken = jwt.sign(
                    {
                        uid: usuario._id.toString(),
                        purpose: "client_activation"
                    },
                    secret,
                    { expiresIn: "10m" }
                );

                await ClienteRepository.configurarTokenActivacionCliente(
                    usuario._id,
                    signedActivationToken,
                    expiracion10Min
                );

                // Enviar correo de activación en segundo plano para no bloquear la respuesta HTTP
                // indicando que el enlace vence en 10 minutos
                const nombreParaCorreo =
                    `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() ||
                    datos.nombreCompleto ||
                    "Cliente";

                this.enviarCorreoActivacionCliente10Min(
                    usuario.correo,
                    nombreParaCorreo,
                    `${baseUrlActivacion}/activar-cuenta?token=${encodeURIComponent(signedActivationToken)}`
                ).catch((mailErr) => {
                    console.error("[ClienteService] Error enviando correo de activación:", mailErr.message);
                });
            }

            const clienteCompleto = await ClienteRepository.obtenerPorId(cliente._id);

            return clienteCompleto;

        } catch (error) {
            // Si falla la creación del cliente, eliminar el usuario que acabamos de crear
            await UsuarioHelper.eliminarFisico(
                usuario._id
            );

            throw error;
        }
    }

    // ======================================================
    // OBTENER TODOS
    // ======================================================

    async obtenerTodos(page, limit, search, estado) {
        return await ClienteRepository.obtenerTodos(page, limit, search, estado);
    }

    // ======================================================
    // OBTENER LISTA (SIN PAGINAR)
    // ======================================================

    async obtenerLista() {
        return await ClienteRepository.obtenerLista();
    }

    // ======================================================
    // OBTENER POR USUARIO
    // ======================================================

    async obtenerPorUsuario(usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new AppError(
                "El id del usuario no es válido.",
                400
            );
        }

        const cliente = await ClienteRepository.obtenerPorUsuario(usuarioId);

        if (!cliente) {
            throw new AppError(
                "La cuenta del cliente ya no existe o fue eliminada.",
                401
            );
        }

        if (cliente.estado === false || (cliente.usuario && cliente.usuario.estado === false)) {
            throw new AppError(
                "Tu cuenta de cliente se encuentra desactivada.",
                401
            );
        }

        return cliente;
    }

    // ======================================================
    // OBTENER POR ID
    // ======================================================

    async obtenerPorId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del cliente no es válido.",
                400
            );
        }

        let cliente = await ClienteRepository.obtenerPorId(id);

        if (!cliente) {
            cliente = await ClienteRepository.obtenerPorUsuario(id);
        }

        if (!cliente) {
            throw new AppError(
                "Cliente no encontrado.",
                404
            );
        }

        return cliente;
    }

    // ======================================================
    // ACTUALIZAR
    // ======================================================

    async actualizar(id, datos) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del cliente no es válido.",
                400
            );
        }

        let cliente = await ClienteRepository.obtenerPorId(id);

        if (!cliente) {
            cliente = await ClienteRepository.obtenerPorUsuario(id);
        }

        if (!cliente) {
            const usuarioExiste = await UsuarioRepository.obtenerPorId(id);
            if (usuarioExiste) {
                const creado = await ClienteRepository.crear({
                    usuario: usuarioExiste._id,
                    direccion: datos.direccion ? datos.direccion.trim() : "Sin dirección registrada",
                    foto: datos.foto || null
                });
                cliente = await ClienteRepository.obtenerPorId(creado._id);
            }
        }

        if (!cliente) {
            throw new AppError(
                "Cliente no encontrado.",
                404
            );
        }

        // Prohibir modificación de tipoDocumento y documento en la actualización del cliente
        const existingTipoDoc = (cliente.usuario?.tipoDocumento || "").toString().trim().toUpperCase();
        const existingDoc = (cliente.usuario?.documento || "").toString().trim();

        if (
            datos.tipoDocumento !== undefined &&
            existingTipoDoc &&
            datos.tipoDocumento.toString().trim().toUpperCase() !== existingTipoDoc
        ) {
            throw new AppError("El tipo de documento del cliente no puede ser modificado.", 400);
        }

        if (
            datos.documento !== undefined &&
            existingDoc &&
            datos.documento.toString().trim() !== existingDoc
        ) {
            throw new AppError("El número de documento del cliente no puede ser modificado.", 400);
        }

        delete datos.tipoDocumento;
        delete datos.documento;

        validarDatosCliente(datos, { esActualizacion: true });

        const currentUsuarioId = (cliente.usuario?._id || cliente.usuario || "").toString();

        if (datos.correo) {
            const correoExistente = await UsuarioRepository.obtenerPorCorreo(datos.correo);
            if (correoExistente && correoExistente._id.toString() !== currentUsuarioId) {
                throw new AppError("El correo electrónico ya se encuentra registrado en otro usuario.", 409);
            }
        }

        if (datos.direccion) {
            datos.direccion = datos.direccion.trim();
        }

        // Sincronizar foto, estado y datos con el Usuario vinculado si existen (sin modificar tipoDocumento ni documento)
        if (cliente.usuario) {
            const usuarioId = cliente.usuario._id || cliente.usuario;
            const usuarioUpdates = {};
            if (datos.estado !== undefined) usuarioUpdates.estado = Boolean(datos.estado);
            if (datos.foto !== undefined) usuarioUpdates.foto = datos.foto;
            if (datos.nombre) usuarioUpdates.nombre = datos.nombre;
            if (datos.apellido) usuarioUpdates.apellido = datos.apellido;
            if (datos.telefono) usuarioUpdates.telefono = datos.telefono;
            if (datos.correo) usuarioUpdates.correo = datos.correo;
            if (datos.fechaNacimiento) usuarioUpdates.fechaNacimiento = datos.fechaNacimiento;
            if (datos.edad !== undefined) usuarioUpdates.edad = datos.edad;

            if (Object.keys(usuarioUpdates).length > 0) {
                try {
                    await UsuarioHelper.actualizar(usuarioId, usuarioUpdates);
                } catch (uErr) {
                    console.warn("[ClienteService] Advertencia sincronizando usuario vinculado:", uErr.message);
                }
            }
        }

        return await ClienteRepository.actualizar(
            cliente._id,
            datos
        );
    }

    // ======================================================
    // ELIMINAR
    // ======================================================

    async eliminar(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del cliente no es válido.",
                400
            );
        }

        const cliente = await ClienteRepository.obtenerPorId(id);

        if (!cliente) {
            throw new AppError(
                "Cliente no encontrado.",
                404
            );
        }

        const usuarioId = cliente.usuario?._id || cliente.usuario;
        const correoCliente = (cliente.usuario?.correo || "").toString().trim().toLowerCase();

        const vehiculos = await VehiculoRepository.obtenerPorCliente(id);
        const solicitudesPorId = await SolicitudRepository.obtenerPorCliente(id);
        const solicitudesPorCorreo = correoCliente
            ? await SolicitudRepository.obtenerTodos({ correoCliente })
            : [];

        const tieneVehiculos = Array.isArray(vehiculos) && vehiculos.length > 0;
        const tieneServicios =
            (Array.isArray(solicitudesPorId) && solicitudesPorId.length > 0) ||
            (Array.isArray(solicitudesPorCorreo) && solicitudesPorCorreo.length > 0);

        if (tieneVehiculos || tieneServicios) {
            // Desactivar cliente y su usuario vinculado para revocar acceso móvil inmediatamente
            await ClienteRepository.eliminar(id);
            if (usuarioId) {
                await UsuarioHelper.eliminar(usuarioId);
            }

            let msg = "El cliente tiene ";
            if (tieneVehiculos) msg += "vehículos asociados";
            if (tieneServicios) {
                if (tieneVehiculos) msg += " y ";
                msg += "solicitudes de servicio registradas";
            }
            throw new AppError(msg + ". Por lo tanto, ha sido desactivado en lugar de eliminado.", 400);
        }

        // Eliminación física (cliente sin servicios ni vehículos asociados)
        await ClienteRepository.eliminarFisico(id);

        if (usuarioId) {
            await UsuarioHelper.eliminarFisico(usuarioId);
        }

        return;
    }

    // ======================================================
    // VERIFICAR DOCUMENTO / CÉDULA
    // ======================================================

    // excluirUsuarioId: usuario en edición, para no reportarse a sí mismo como duplicado
    async verificarDocumento(documento, excluirUsuarioId = null) {
        if (!documento || !documento.trim()) {
            throw new AppError("El documento es obligatorio para realizar la verificación.", 400);
        }

        if (excluirUsuarioId && !mongoose.Types.ObjectId.isValid(excluirUsuarioId)) {
            throw new AppError("El id del usuario a excluir no es válido.", 400);
        }

        const doc = documento.trim();
        const usuarioExistente = await UsuarioRepository.obtenerPorDocumento(doc);

        if (usuarioExistente && usuarioExistente._id.toString() !== String(excluirUsuarioId || "")) {
            return {
                disponible: false,
                existe: true,
                mensaje: "Ya existe un usuario registrado con este documento de identidad.",
                usuario: {
                    _id: usuarioExistente._id,
                    nombre: `${usuarioExistente.nombre || ''} ${usuarioExistente.apellido || ''}`.trim(),
                    correo: usuarioExistente.correo,
                    documento: usuarioExistente.documento
                }
            };
        }

        return {
            disponible: true,
            existe: false,
            mensaje: "El documento está disponible para registro."
        };
    }

    // ======================================================
    // VERIFICAR CORREO
    // ======================================================

    // El correo es único en toda la colección de usuarios (clientes, conductores, administradores)
    async verificarCorreo(correo, excluirUsuarioId = null) {
        const correoLimpio = (correo || "").toString().trim().toLowerCase();

        if (!correoLimpio) {
            throw new AppError("El correo es obligatorio para realizar la verificación.", 400);
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correoLimpio)) {
            throw new AppError("El correo electrónico no tiene un formato válido.", 400);
        }

        if (excluirUsuarioId && !mongoose.Types.ObjectId.isValid(excluirUsuarioId)) {
            throw new AppError("El id del usuario a excluir no es válido.", 400);
        }

        const usuarioExistente = await UsuarioRepository.obtenerPorCorreo(correoLimpio);

        if (usuarioExistente && usuarioExistente._id.toString() !== String(excluirUsuarioId || "")) {
            return {
                disponible: false,
                existe: true,
                mensaje: "El correo electrónico ya se encuentra registrado.",
                usuario: { _id: usuarioExistente._id }
            };
        }

        return {
            disponible: true,
            existe: false,
            mensaje: "El correo electrónico está disponible para registro."
        };
    }

    // ======================================================
    // ACTIVACIÓN DE CUENTA DE CLIENTE (10 MINUTOS, UN SOLO USO)
    // ======================================================

    async enviarCorreoActivacionCliente10Min(correo, nombre, enlaceActivacion) {
        const transporter = await EmailService.getTransporter();

        if (!transporter) {
            console.log(`==================================================`);
            console.log(`📧 [ACTIVACIÓN DE CUENTA CLIENTE (10 MIN) - MODO LOCAL]`);
            console.log(`👤 Cliente: ${nombre}`);
            console.log(`🔗 Enlace de activación (vence en 10 minutos): ${enlaceActivacion}`);
            console.log(`==================================================`);
            return;
        }

        const fromAddress = env.MAIL_USER || "seguridad@miconductor.com";
        await transporter.sendMail({
            from: `"Mi Conductor" <${fromAddress}>`,
            to: correo,
            subject: "Activa tu cuenta en Mi Conductor y establece tu contraseña",
            html: `
                <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
                    <div style="margin-bottom: 24px;">
                        <span style="font-size: 12px; font-weight: 700; color: #FB9833; text-transform: uppercase; letter-spacing: 0.1em;">
                            MI CONDUCTOR
                        </span>
                        <h2 style="color: #11384a; margin: 6px 0 0; font-size: 22px; font-weight: 700;">
                            ¡Bienvenido a Mi Conductor!
                        </h2>
                    </div>

                    <p style="color: #334155; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">
                        Hola <strong>${nombre}</strong>,
                    </p>

                    <p style="color: #334155; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                        Tu cuenta de cliente ha sido creada exitosamente en la plataforma <strong>Mi Conductor</strong>. Por motivos de seguridad, para activar tu acceso debes establecer tu propia contraseña en el siguiente enlace:
                    </p>

                    <div style="margin: 28px 0; text-align: center;">
                        <a
                            href="${enlaceActivacion}"
                            style="display: inline-block; padding: 14px 32px; background-color: #FB9833; color: #012538; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(251, 152, 51, 0.35);"
                        >
                            Activar mi cuenta y crear contraseña
                        </a>
                    </div>

                    <!-- EXPLICACIÓN USO EN APP MÓVIL -->
                    <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 18px 20px; margin: 24px 0;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 18px;">📱</span>
                            <h3 style="color: #1e40af; margin: 0; font-size: 15px; font-weight: 700;">
                                Continuar en la Aplicación Móvil
                            </h3>
                        </div>
                        <p style="color: #1e3a8a; font-size: 13.5px; line-height: 1.55; margin: 0;">
                            Una vez que actives tu cuenta y crees tu contraseña, <strong>debes continuar e iniciar sesión en la aplicación móvil de Mi Conductor</strong> en tu celular para solicitar traslados de vehículos, registrar tus autos y gestionar tus servicios. La plataforma web está reservada exclusivamente para la administración interna del sistema.
                        </p>
                    </div>

                    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 8px; margin: 24px 0;">
                        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.4;">
                            <strong>Importante:</strong> Este enlace de activación es seguro, de un solo uso y <strong>vence en 10 minutos</strong>.
                        </p>
                    </div>

                    <p style="color: #64748b; font-size: 12.5px; line-height: 1.5; margin: 0 0 24px 0;">
                        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br />
                        <a href="${enlaceActivacion}" style="color: #ea580c; word-break: break-all;">${enlaceActivacion}</a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0;" />

                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        Equipo Mi Conductor — Seguridad y Confianza
                    </p>
                </div>
            `
        });
    }

    async verificarTokenActivacionCliente(token) {
        const cleanToken = (token || "").toString().trim();
        if (!cleanToken) {
            throw new AppError("El enlace ha expirado o no es válido", 410);
        }

        // Si el token es un JWT firmado, verificar su firma y claim "exp" (10 minutos)
        if (cleanToken.split(".").length === 3) {
            const secret = process.env.JWT_SECRET || env.JWT_SECRET || "mi_conductor_secret";
            try {
                const payload = jwt.verify(cleanToken, secret);
                if (!payload || payload.purpose !== "client_activation") {
                    throw new AppError("El enlace ha expirado o no es válido", 410);
                }
            } catch {
                throw new AppError("El enlace ha expirado o no es válido", 410);
            }
        }

        // Verificar en base de datos que el token exista, no haya sido usado (isActivated === false)
        // y que activationTokenExpires sea posterior al momento actual
        const usuario = await ClienteRepository.obtenerUsuarioPorTokenActivacionCliente(cleanToken);
        if (!usuario) {
            throw new AppError("El enlace ha expirado o no es válido", 410);
        }

        return {
            valid: true,
            usuarioId: usuario._id,
            correo: usuario.correo,
            documento: usuario.documento || "",
            nombre: usuario.nombre || "",
            apellido: usuario.apellido || "",
            nombreCompleto: `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || usuario.nombreCompleto || "Cliente",
            rol: usuario.rol?.nombre || "CLIENTE"
        };
    }

    async activarCuentaCliente({ token, password, confirmPassword }) {
        // 1. Verificar token (10 minutos + un solo uso)
        const userInfo = await this.verificarTokenActivacionCliente(token);

        // 2. Validar requisitos estrictos de contraseña en el backend
        const validacion = validarPasswordActivacionCliente(password, confirmPassword, userInfo);
        if (!validacion.valid) {
            throw new AppError(validacion.message, 400);
        }

        // 3. Hashear contraseña con bcrypt (nunca guardar ni registrar en texto plano)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(String(password), salt);

        // 4. Consumir token de forma atómica (un solo uso: limpia activationToken y marca isActivated = true)
        const actualizado = await ClienteRepository.consumirTokenYActivarCliente(
            userInfo.usuarioId,
            String(token).trim(),
            passwordHash
        );

        if (!actualizado) {
            throw new AppError("El enlace ha expirado o no es válido", 410);
        }

        return {
            mensaje: "Tu contraseña ha sido creada y tu cuenta ya se encuentra activa.",
            userInfo
        };
    }

}

export default new ClienteService();
