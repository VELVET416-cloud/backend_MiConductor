import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

const getTransporter = () => {
    const isGmail = env.MAIL_HOST?.includes("gmail") || env.MAIL_USER?.includes("@gmail.com");
    const port = Number(env.MAIL_PORT) || 587;
    const isSecure = port === 465;

    return nodemailer.createTransport({
        host: env.MAIL_HOST || (isGmail ? "smtp.gmail.com" : undefined),
        port: port,
        secure: isSecure,
        auth: {
            user: env.MAIL_USER,
            pass: env.MAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

class EmailService {

    async enviarCorreoRecuperacion(
        correo,
        nombre,
        token,
        origen = "web"
    ) {

        const baseUrl =
            origen === "mobile"
                ? env.MOBILE_CLIENT_URL
                : env.CLIENT_URL;

        const enlace =
            `${baseUrl}/reset-password?token=${token}`;

        const transporter = getTransporter();
        return await transporter.sendMail({
            from: `"Mi Conductor" <${env.MAIL_USER}>`,
            to: correo,
            subject: "Recuperación de contraseña - Mi Conductor",

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                ">

                    <h2>Recuperación de contraseña</h2>

                    <p>Hola ${nombre},</p>

                    <p>
                        Recibimos una solicitud para cambiar
                        la contraseña de tu cuenta de Mi Conductor.
                    </p>

                    <p>
                        Haz clic en el siguiente botón para
                        crear una nueva contraseña:
                    </p>

                    <a
                        href="${enlace}"
                        style="
                            display: inline-block;
                            padding: 12px 20px;
                            background-color: #FB9833;
                            color: #012538;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: bold;
                        "
                    >
                        Cambiar contraseña
                    </a>

                    <p>
                        Este enlace será válido durante 15 minutos.
                    </p>

                    <p>
                        Si no solicitaste este cambio,
                        puedes ignorar este correo.
                    </p>

                    <p>
                        Equipo Mi Conductor
                    </p>

                </div>
            `
        });
    }

    // ======================================================
    // BIENVENIDA A NUEVO CLIENTE
    // ======================================================

    async enviarBienvenida({ correo, nombre, usuario, clave }) {
        const transporter = getTransporter();
        return await transporter.sendMail({
            from: `"Mi Conductor" <${env.MAIL_USER}>`,
            to: correo,
            subject: "¡Bienvenido a Mi Conductor! 🚗",
            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 0;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                ">
                    <!-- HEADER -->
                    <div style="
                        background: linear-gradient(135deg, #012538 0%, #0f4c75 100%);
                        padding: 36px 40px;
                        text-align: center;
                    ">
                        <h1 style="color: #FB9833; margin: 0; font-size: 28px; letter-spacing: -0.5px;">
                            Mi Conductor
                        </h1>
                        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">
                            Tu aliado en el camino
                        </p>
                    </div>

                    <!-- BODY -->
                    <div style="padding: 36px 40px; background: #ffffff;">
                        <h2 style="color: #012538; margin: 0 0 16px; font-size: 20px;">
                            ¡Hola, ${nombre}! 👋
                        </h2>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                            Tu cuenta en <strong>Mi Conductor</strong> ha sido creada exitosamente.
                            A continuación encontrarás tus credenciales de acceso:
                        </p>

                        <!-- CREDENTIALS BOX -->
                        <div style="
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-left: 4px solid #FB9833;
                            border-radius: 8px;
                            padding: 20px 24px;
                            margin-bottom: 28px;
                        ">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 120px;">USUARIO</td>
                                    <td style="padding: 8px 0; color: #012538; font-size: 15px; font-weight: 700;">${usuario}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">CONTRASEÑA</td>
                                    <td style="padding: 8px 0; color: #012538; font-size: 15px; font-weight: 700;">${clave}</td>
                                </tr>
                            </table>
                        </div>

                        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                            🔒 Por seguridad, te recomendamos cambiar tu contraseña luego del primer inicio de sesión.
                        </p>
                        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 28px;">
                            Tu nombre de usuario es tu número de documento de identidad.
                        </p>

                        <div style="text-align: center;">
                            <a
                                href="${env.CLIENT_URL}"
                                style="
                                    display: inline-block;
                                    padding: 14px 32px;
                                    background: linear-gradient(135deg, #FB9833, #f97316);
                                    color: #ffffff;
                                    text-decoration: none;
                                    border-radius: 8px;
                                    font-weight: bold;
                                    font-size: 15px;
                                    letter-spacing: 0.3px;
                                "
                            >
                                Iniciar sesión 🚀
                            </a>
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div style="
                        background: #f8fafc;
                        padding: 20px 40px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                    ">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            Si no esperabas este correo, puedes ignorarlo.
                            Este mensaje fue generado automáticamente por Mi Conductor.
                        </p>
                    </div>
                </div>
            `
        });
    }
}

export default new EmailService();