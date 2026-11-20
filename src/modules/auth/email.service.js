import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

let etherealAccount = null;

class EmailService {

    async getTransporter() {
        if (env.MAIL_USER && env.MAIL_PASSWORD) {
            const isGmail = (env.MAIL_HOST && env.MAIL_HOST.includes("gmail")) || (env.MAIL_USER && env.MAIL_USER.includes("@gmail.com"));
            if (isGmail) {
                return nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: env.MAIL_USER,
                        pass: env.MAIL_PASSWORD
                    }
                });
            }

            return nodemailer.createTransport({
                host: env.MAIL_HOST || "smtp.gmail.com",
                port: Number(env.MAIL_PORT) || 587,
                secure: Number(env.MAIL_PORT) === 465,
                auth: {
                    user: env.MAIL_USER,
                    pass: env.MAIL_PASSWORD
                }
            });
        }

        // Si no hay credenciales SMTP en .env, usar cuenta de prueba Ethereal
        if (!etherealAccount) {
            try {
                etherealAccount = await nodemailer.createTestAccount();
                console.log(`[EmailService] Servidor de prueba Ethereal inicializado: ${etherealAccount.user}`);
            } catch (err) {
                console.warn(`[EmailService] No se pudo conectar a Ethereal: ${err.message}. Modo simulación local activo.`);
                return null;
            }
        }

        return nodemailer.createTransport({
            host: etherealAccount.smtp.host,
            port: etherealAccount.smtp.port,
            secure: etherealAccount.smtp.secure,
            auth: {
                user: etherealAccount.user,
                pass: etherealAccount.pass
            }
        });
    }

    async enviarCorreoRecuperacion(correo, nombre, token, origen = "web") {
        const baseUrl = origen === "mobile" ? env.MOBILE_CLIENT_URL : env.CLIENT_URL;
        const enlace = `${baseUrl}/reset-password?token=${token}`;

        const transporter = await this.getTransporter();

        if (!transporter) {
            console.log(`==================================================`);
            console.log(`🔑 [SIMULACIÓN RECUPERACIÓN] Correo: ${correo}`);
            console.log(`🔗 Enlace: ${enlace}`);
            console.log(`==================================================`);
            return;
        }

        try {
            const info = await transporter.sendMail({
                from: `"Mi Conductor" <${env.MAIL_USER || "no-reply@miconductor.com"}>`,
                to: correo,
                subject: "Recuperación de contraseña - Mi Conductor",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                        <h2 style="color: #11384a; margin-top: 0;">Recuperación de contraseña</h2>
                        <p style="color: #334155; font-size: 15px;">Hola <strong>${nombre}</strong>,</p>
                        <p style="color: #334155; font-size: 14px; line-height: 1.5;">
                            Recibimos una solicitud para cambiar la contraseña de tu cuenta en <strong>Mi Conductor</strong>.
                        </p>
                        <p style="color: #334155; font-size: 14px;">
                            Haz clic en el siguiente botón para crear una nueva contraseña:
                        </p>
                        <div style="margin: 25px 0;">
                            <a
                                href="${enlace}"
                                style="display: inline-block; padding: 12px 24px; background-color: #FB9833; color: #012538; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;"
                            >
                                Cambiar contraseña
                            </a>
                        </div>
                        <p style="color: #64748b; font-size: 13px;">
                            Este enlace será válido durante 15 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje.
                        </p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            Equipo Mi Conductor
                        </p>
                    </div>
                `
            });

            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`==================================================`);
            console.log(`📧 CORREO DE RECUPERACIÓN ENVIADO A: ${correo}`);
            if (previewUrl) {
                console.log(`🔗 Vista previa (Ethereal): ${previewUrl}`);
            }
            console.log(`==================================================`);
        } catch (error) {
            console.error(`[EmailService] Error enviando correo de recuperación a ${correo}:`, error.message);
        }
    }

    async enviarCredencialesNuevoUsuario(datos) {
        const { correo, nombre, password, rol = "Usuario" } = datos;
        const loginUrl = `${env.CLIENT_URL || "http://localhost:5173"}/login`;

        console.log(`[EmailService] Preparando correo de credenciales para: ${correo} (Rol: ${rol})`);

        const transporter = await this.getTransporter();

        if (!transporter) {
            console.log(`==================================================`);
            console.log(`📧 [CREDENCIALES REGISTRADAS - MODO LOCAL]`);
            console.log(`👤 Usuario: ${nombre} (${rol})`);
            console.log(`📬 Correo: ${correo}`);
            console.log(`🔑 Contraseña: ${password}`);
            console.log(`🌐 Login: ${loginUrl}`);
            console.log(`==================================================`);
            return;
        }

        try {
            const fromAddress = env.MAIL_USER || "bienvenido@miconductor.com";
            const info = await transporter.sendMail({
                from: `"Mi Conductor" <${fromAddress}>`,
                to: correo,
                subject: `Bienvenido a Mi Conductor - Tus credenciales de acceso (${rol})`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
                        <div style="margin-bottom: 24px;">
                            <span style="font-size: 12px; font-weight: 700; color: #FB9833; text-transform: uppercase; letter-spacing: 0.1em;">
                                MI CONDUCTOR
                            </span>
                            <h2 style="color: #11384a; margin: 6px 0 0; font-size: 22px; font-weight: 700;">
                                ¡Bienvenido a la plataforma!
                            </h2>
                        </div>

                        <p style="color: #334155; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">
                            Hola <strong>${nombre}</strong>,
                        </p>

                        <p style="color: #334155; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                            Se ha creado tu cuenta exitosamente en el sistema <strong>Mi Conductor</strong> con el rol de <strong>${rol}</strong>. A continuación encontrarás tus credenciales para iniciar sesión:
                        </p>

                        <div style="background: #f8fafc; border-left: 4px solid #FB9833; padding: 18px 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">
                                <strong style="color: #1e293b;">Correo de acceso:</strong>
                                <br />
                                <span style="color: #0f172a; font-size: 15px; font-weight: 600;">${correo}</span>
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #475569;">
                                <strong style="color: #1e293b;">Contraseña temporal:</strong>
                                <br />
                                <span style="display: inline-block; margin-top: 4px; background: #e2e8f0; padding: 4px 10px; border-radius: 6px; font-size: 16px; font-weight: 700; color: #0f172a; font-family: monospace;">${password}</span>
                            </p>
                        </div>

                        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 24px 0;">
                            Por tu seguridad, te recomendamos cambiar tu contraseña una vez hayas iniciado sesión por primera vez desde el menú de tu perfil.
                        </p>

                        <div style="margin: 28px 0;">
                            <a
                                href="${loginUrl}"
                                style="display: inline-block; padding: 13px 28px; background-color: #FB9833; color: #012538; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14.5px; box-shadow: 0 2px 8px rgba(251, 152, 51, 0.3);"
                            >
                                Iniciar sesión en Mi Conductor
                            </a>
                        </div>

                        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0;" />

                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            Este es un correo automático enviado por el sistema de gestión de Mi Conductor.
                        </p>
                    </div>
                `
            });

            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`==================================================`);
            console.log(`📧 CORREO DE BIENVENIDA ENVIADO CON ÉXITO`);
            console.log(`👤 Destinatario: ${nombre} (${correo})`);
            console.log(`🔑 Contraseña enviada: ${password}`);
            console.log(`🌐 Rol: ${rol}`);
            if (previewUrl) {
                console.log(`🔗 Vista previa interactiva (Ethereal): ${previewUrl}`);
            }
            console.log(`==================================================`);
        } catch (error) {
            console.error(`[EmailService] Error al enviar correo de credenciales a ${correo}:`, error.message);
        }
    }

    async enviarCorreoActivacion(correo, nombre, token, origen = "web") {
        const baseUrl = origen === "mobile" ? env.MOBILE_CLIENT_URL : env.CLIENT_URL;
        const enlaceActivacion = `${baseUrl}/activar-cuenta?token=${token}`;

        console.log(`[EmailService] Preparando correo de activación para: ${correo}`);

        const transporter = await this.getTransporter();

        if (!transporter) {
            console.log(`==================================================`);
            console.log(`📧 [ACTIVACIÓN DE CUENTA - MODO LOCAL]`);
            console.log(`👤 Usuario: ${nombre}`);
            console.log(`📬 Correo: ${correo}`);
            console.log(`🔗 Enlace de activación: ${enlaceActivacion}`);
            console.log(`==================================================`);
            return;
        }

        try {
            const fromAddress = env.MAIL_USER || "seguridad@miconductor.com";
            const info = await transporter.sendMail({
                from: `"Mi Conductor" <${fromAddress}>`,
                to: correo,
                subject: "Activa tu cuenta en Mi Conductor y establece tu contraseña",
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
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
                            Tu cuenta ha sido creada exitosamente en la plataforma <strong>Mi Conductor</strong>. Por motivos de seguridad, para activar tu acceso debes establecer tu propia contraseña en el siguiente enlace:
                        </p>

                        <div style="margin: 28px 0; text-align: center;">
                            <a
                                href="${enlaceActivacion}"
                                style="display: inline-block; padding: 14px 32px; background-color: #FB9833; color: #012538; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(251, 152, 51, 0.35);"
                            >
                                Activar mi cuenta y crear contraseña
                            </a>
                        </div>

                        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 8px; margin: 24px 0;">
                            <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.4;">
                                <strong>Importante:</strong> Este enlace de activación es seguro, de un solo uso y expirará en <strong>24 horas</strong>.
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

            console.log(`==================================================`);
            console.log(`📧 CORREO DE ACTIVACIÓN ENVIADO CON ÉXITO`);
            console.log(`👤 Destinatario: ${nombre} (${correo})`);
            console.log(`🔗 Enlace: ${enlaceActivacion}`);
            console.log(`==================================================`);
        } catch (error) {
            console.error(`[EmailService] Error al enviar correo de activación a ${correo}:`, error.message);
        }
    }
    }

export default new EmailService();
