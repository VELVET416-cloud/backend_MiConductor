import ClienteService from "./cliente.service.js";
import AuthService from "../auth/auth.service.js";

import { successResponse } from "../../responses/success.response.js";

/**
 * Controlador encargado de gestionar las operaciones relacionadas
 * con los clientes.
 *
 * Se comunica con ClienteService para realizar las operaciones
 * de creación, consulta, actualización y eliminación.
 */
class ClienteController {

    /**
     * Crea un nuevo cliente.
     */
    async crear(req, res, next) {
        try {
            const cliente = await ClienteService.crear(req.body);

            return successResponse(
                res,
                cliente,
                "Cliente creado correctamente.",
                201
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene todos los clientes registrados.
     */
    async obtenerTodos(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const estado = req.query.estado || '';

            const clientesData = await ClienteService.obtenerTodos(page, limit, search, estado);

            return successResponse(
                res,
                clientesData,
                "Clientes obtenidos correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene una lista no paginada de todos los clientes activos.
     */
    async obtenerLista(req, res, next) {
        try {
            const clientes = await ClienteService.obtenerLista();
            return successResponse(
                res,
                clientes,
                "Lista de clientes obtenida correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene un cliente específico por su ID de Usuario.
     */
    async obtenerPorUsuario(req, res, next) {
        try {
            const { usuarioId } = req.params;
            const cliente = await ClienteService.obtenerPorUsuario(usuarioId);

            return successResponse(
                res,
                cliente,
                "Cliente obtenido correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene un cliente específico utilizando su ID.
     */
    async obtenerPorId(req, res, next) {
        try {
            const { id } = req.params;
            const cliente = await ClienteService.obtenerPorId(id);

            return successResponse(
                res,
                cliente,
                "Cliente obtenido correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualiza la información de un cliente existente.
     */
    async actualizar(req, res, next) {
        try {
            const { id } = req.params;
            const cliente = await ClienteService.actualizar(
                id,
                req.body
            );

            return successResponse(
                res,
                cliente,
                "Cliente actualizado correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Elimina un cliente utilizando su ID.
     */
    async eliminar(req, res, next) {
        try {
            const { id } = req.params;
            await ClienteService.eliminar(id);

            return successResponse(
                res,
                null,
                "Cliente eliminado correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verifica si un documento/cédula ya está registrado en el sistema.
     */
    async verificarDocumento(req, res, next) {
        try {
            const { documento } = req.params;
            const resultado = await ClienteService.verificarDocumento(documento);

            return successResponse(
                res,
                resultado,
                resultado.mensaje
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Renderiza la página de activación y creación de contraseña para el cliente
     * verificando el token directamente en el servidor (sin quedarse cargando).
     */
    async activarCuentaPage(req, res) {
        const token = (req.query.token || "").toString().trim();
        res.removeHeader("Content-Security-Policy");
        res.setHeader("Content-Type", "text/html; charset=utf-8");

        let userInfo = null;
        let tokenError = "";

        if (!token) {
            tokenError = "No se proporcionó un token de activación válido.";
        } else {
            try {
                userInfo = await AuthService.verifyActivationToken(token);
            } catch (err) {
                tokenError = err.message || "El enlace de activación es inválido o ya fue utilizado.";
            }
        }

        return res.send(this._renderActivationHtml({
            token,
            userInfo,
            error: tokenError,
            success: false
        }));
    }

    /**
     * Procesa el formulario POST para guardar la contraseña del cliente y activar su cuenta.
     */
    async activarCuentaSubmit(req, res) {
        const token = (req.body.token || req.query.token || "").toString().trim();
        const password = (req.body.password || "").toString().trim();
        const confirmPassword = (req.body.confirmPassword || "").toString().trim();

        res.removeHeader("Content-Security-Policy");
        res.setHeader("Content-Type", "text/html; charset=utf-8");

        let userInfo = null;
        try {
            if (token) {
                userInfo = await AuthService.verifyActivationToken(token);
            }
        } catch (err) {
            return res.send(this._renderActivationHtml({
                token,
                userInfo: null,
                error: err.message || "El enlace de activación es inválido o ya fue utilizado.",
                success: false
            }));
        }

        if (password.length < 6) {
            return res.send(this._renderActivationHtml({
                token,
                userInfo,
                error: "La contraseña debe tener al menos 6 caracteres.",
                success: false
            }));
        }

        if (password !== confirmPassword) {
            return res.send(this._renderActivationHtml({
                token,
                userInfo,
                error: "Las contraseñas no coinciden. Verifica e intenta nuevamente.",
                success: false
            }));
        }

        try {
            await AuthService.activateAccount({ token, password });
            return res.send(this._renderActivationHtml({
                token,
                userInfo,
                error: "",
                success: true
            }));
        } catch (err) {
            return res.send(this._renderActivationHtml({
                token,
                userInfo,
                error: err.message || "No se pudo guardar la contraseña.",
                success: false
            }));
        }
    }

    _renderActivationHtml({ token, userInfo, error, success }) {
        const safeToken = (token || "").replace(/"/g, "&quot;");
        const safeNombre = (userInfo?.nombre || "Cliente").replace(/</g, "&lt;");
        const safeCorreo = (userInfo?.correo || "").replace(/</g, "&lt;");
        const safeError = (error || "").replace(/</g, "&lt;");

        return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Activar Cuenta de Cliente - Mi Conductor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0b3b4a 0%, #12566b 50%, #16262d 100%);
      padding: 20px;
      color: #0f172a;
    }
    .card {
      background: #ffffff;
      width: 100%;
      max-width: 440px;
      border-radius: 24px;
      padding: 36px 32px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #ea580c;
      background: #ffedd5;
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 10px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 13.5px;
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 22px;
    }
    .user-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #ea580c;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      color: #334155;
      margin-bottom: 20px;
    }
    .user-box strong { color: #0f172a; }
    .field { margin-bottom: 16px; }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }
    input[type="password"], input[type="text"] {
      width: 100%;
      height: 44px;
      padding: 0 14px;
      border-radius: 12px;
      border: 1.5px solid #cbd5e1;
      font-size: 14px;
      color: #0f172a;
      background: #f8fafc;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input:focus {
      border-color: #ea580c;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15);
    }
    .error-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 13px;
      margin-bottom: 16px;
      font-weight: 500;
    }
    .success-box {
      text-align: center;
      padding: 12px 0 6px;
    }
    .success-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #dcfce7;
      color: #16a34a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: bold;
      margin: 0 auto 14px;
    }
    .submit-btn {
      width: 100%;
      height: 46px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #fb923c, #ea580c);
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 6px 16px rgba(234, 88, 12, 0.3);
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Mi Conductor · Cliente Móvil</span>
    <h1>${success ? "¡Cuenta Activada!" : "Configura tu contraseña"}</h1>
    ${!success ? `<p class="subtitle">Establece tu contraseña personal para activar tu cuenta e iniciar sesión en la aplicación móvil.</p>` : ""}

    ${safeError ? `<div class="error-box">${safeError}</div>` : ""}

    ${success ? `
      <div class="success-box">
        <div class="success-icon">✓</div>
        <h2 style="font-size:19px; color:#0f172a; margin-bottom:8px;">¡Contraseña guardada exitosamente!</h2>
        <p style="font-size:13.5px; color:#475569; line-height:1.5; margin-bottom:14px;">
          La cuenta de <strong>${safeNombre}</strong> (<strong>${safeCorreo}</strong>) ya se encuentra activa.
        </p>
        <p style="font-size:13px; color:#0f172a; background:#f0fdf4; border:1px solid #bbf7d0; padding:12px; border-radius:12px;">
          Ahora puedes abrir la aplicación móvil <strong>Mi Conductor</strong> e iniciar sesión como <strong>Cliente</strong> con tu correo y tu nueva contraseña.
        </p>
      </div>
    ` : userInfo ? `
      <form method="POST" action="/api/clientes/activar-cuenta">
        <input type="hidden" name="token" value="${safeToken}" />
        <div class="user-box">
          <div><strong>Cliente:</strong> ${safeNombre}</div>
          <div style="margin-top:4px;"><strong>Correo de acceso móvil:</strong> ${safeCorreo}</div>
        </div>

        <div class="field">
          <label for="password">Nueva contraseña</label>
          <input type="password" id="password" name="password" placeholder="Mínimo 6 caracteres" required minlength="6" />
        </div>

        <div class="field">
          <label for="confirmPassword">Confirmar contraseña</label>
          <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Repite tu contraseña" required minlength="6" />
        </div>

        <button type="submit" class="submit-btn">
          Guardar contraseña y activar cuenta
        </button>
      </form>
    ` : ""}
  </div>
</body>
</html>`;
    }

}

export default new ClienteController();
