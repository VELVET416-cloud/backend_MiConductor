import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: Number(env.MAIL_PORT),
    secure: false,
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASSWORD
    }
});

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

        await transporter.sendMail({
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
}

export default new EmailService();