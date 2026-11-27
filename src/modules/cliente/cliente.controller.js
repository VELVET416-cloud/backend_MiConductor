import ClienteService from "./cliente.service.js";
import { env } from "../../config/env.js";
import { COMMON_PASSWORDS_CLIENTE } from "./cliente.validation.js";

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
            const resultado = await ClienteService.verificarDocumento(documento, req.query.excluirId || null);

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
     * Verifica si un correo ya está registrado (opcionalmente excluyendo un usuario).
     */
    async verificarCorreo(req, res, next) {
        try {
            const { correo } = req.params;
            const resultado = await ClienteService.verificarCorreo(correo, req.query.excluirId || null);

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
     * verificando el token directamente en el servidor (vence a los 10 minutos, un solo uso).
     */
    async activarCuentaPage(req, res) {
        const token = (req.query.token || "").toString().trim();
        res.removeHeader("Content-Security-Policy");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        let userInfo = null;
        let tokenError = "";

        if (!token) {
            tokenError = "El enlace ha expirado o no es válido";
            res.status(410);
        } else {
            try {
                userInfo = await ClienteService.verificarTokenActivacionCliente(token);
            } catch {
                tokenError = "El enlace ha expirado o no es válido";
                res.status(410);
            }
        }

        return res.send(this._renderActivationHtml({
            token,
            userInfo,
            tokenInvalid: Boolean(tokenError),
            error: tokenError,
            success: false
        }));
    }

    /**
     * Procesa el formulario POST para guardar la contraseña del cliente y activar su cuenta.
     * Valida en el backend tanto la vigencia/uso único del token como los requisitos de la contraseña.
     */
    async activarCuentaSubmit(req, res) {
        const token = (req.body.token || req.query.token || "").toString().trim();
        const password = (req.body.password || "").toString();
        const confirmPassword =
            req.body.confirmPassword !== undefined
                ? req.body.confirmPassword.toString()
                : password;

        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        const wantsJson =
            (req.headers.accept && req.headers.accept.includes("application/json")) ||
            (req.headers["content-type"] && req.headers["content-type"].includes("application/json"));

        let userInfo = null;
        try {
            userInfo = await ClienteService.verificarTokenActivacionCliente(token);
        } catch {
            const expiredMsg = "El enlace ha expirado o no es válido";
            if (wantsJson) {
                return res.status(410).json({
                    ok: false,
                    status: 410,
                    message: expiredMsg
                });
            }
            res.removeHeader("Content-Security-Policy");
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.status(410).send(this._renderActivationHtml({
                token,
                userInfo: null,
                tokenInvalid: true,
                error: expiredMsg,
                success: false
            }));
        }

        try {
            await ClienteService.activarCuentaCliente({
                token,
                password,
                confirmPassword
            });

            if (wantsJson) {
                return res.status(200).json({
                    ok: true,
                    status: 200,
                    message: "Contraseña creada y cuenta activada exitosamente."
                });
            }

            res.removeHeader("Content-Security-Policy");
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.status(200).send(this._renderActivationHtml({
                token: "",
                userInfo,
                tokenInvalid: false,
                error: "",
                success: true
            }));
        } catch (err) {
            const status = err.statusCode || 400;
            const isTokenError = status === 401 || status === 410;
            const errMsg = isTokenError
                ? "El enlace ha expirado o no es válido"
                : (err.message || "No se pudo guardar la contraseña.");

            if (wantsJson) {
                return res.status(status).json({
                    ok: false,
                    status,
                    message: errMsg
                });
            }

            res.removeHeader("Content-Security-Policy");
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.status(status).send(this._renderActivationHtml({
                token,
                userInfo: isTokenError ? null : userInfo,
                tokenInvalid: isTokenError,
                error: errMsg,
                success: false
            }));
        }
    }

    _renderActivationHtml({ token, userInfo, tokenInvalid = false, error, success }) {
        const safeToken = (token || "").replace(/"/g, "&quot;");
        const safeNombre = (userInfo?.nombreCompleto || userInfo?.nombre || "Cliente").replace(/</g, "&lt;");
        const safeCorreo = (userInfo?.correo || "").replace(/</g, "&lt;");
        const safeError = (error || "").replace(/</g, "&lt;");
        const recoverUrl = `${process.env.CLIENT_URL || env.CLIENT_URL || "http://localhost:5173"}/recover-password`;

        const correoLower = (userInfo?.correo || "").toLowerCase();
        const mailDomain = correoLower.split("@")[1] || "";
        let webmailUrl = "https://mail.google.com";
        if (mailDomain.includes("outlook") || mailDomain.includes("hotmail") || mailDomain.includes("live")) {
            webmailUrl = "https://outlook.live.com/mail/";
        } else if (mailDomain.includes("yahoo")) {
            webmailUrl = "https://mail.yahoo.com";
        }

        const clientContextJson = JSON.stringify({
            correo: userInfo?.correo || "",
            documento: userInfo?.documento || "",
            nombre: userInfo?.nombre || "",
            apellido: userInfo?.apellido || "",
            nombreCompleto: userInfo?.nombreCompleto || "",
            commonPasswords: COMMON_PASSWORDS_CLIENTE
        }).replace(/</g, "\\u003c");

        return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Activar Cuenta de Cliente - Mi Conductor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
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
      max-width: 480px;
      border-radius: 24px;
      padding: 34px 30px;
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
      font-size: 23px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 13.5px;
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 18px;
    }
    .user-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #ea580c;
      padding: 11px 14px;
      border-radius: 10px;
      font-size: 13px;
      color: #334155;
      margin-bottom: 18px;
    }
    .user-box strong { color: #0f172a; }
    .field { margin-bottom: 14px; }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }
    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-wrap input {
      width: 100%;
      height: 44px;
      padding: 0 44px 0 14px;
      border-radius: 12px;
      border: 1.5px solid #cbd5e1;
      font-size: 14px;
      color: #0f172a;
      background: #f8fafc;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
    }
    .input-wrap input:focus {
      border-color: #ea580c;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15);
    }
    .toggle-eye {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }
    .toggle-eye:hover {
      color: #0f172a;
      background: #f1f5f9;
    }
    .strength-box {
      margin: 8px 0 14px;
    }
    .strength-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 5px;
    }
    .strength-bars {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }
    .strength-bar {
      height: 6px;
      border-radius: 999px;
      background: #e2e8f0;
      transition: background-color 0.2s ease;
    }
    .reqs-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 16px;
    }
    .reqs-title {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 8px;
    }
    .req-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.2px;
      color: #64748b;
      margin-bottom: 5px;
      transition: color 0.15s ease;
    }
    .req-item:last-child { margin-bottom: 0; }
    .req-item.ok {
      color: #15803d;
      font-weight: 600;
    }
    .req-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1.5px solid #cbd5e1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #ffffff;
      color: transparent;
      transition: all 0.15s ease;
    }
    .req-item.ok .req-dot {
      background: #16a34a;
      border-color: #16a34a;
      color: #ffffff;
    }
    .error-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 13px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    .expired-box {
      text-align: center;
      padding: 10px 0 4px;
    }
    .expired-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #fee2e2;
      color: #dc2626;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
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
      margin-top: 4px;
      transition: opacity 0.15s, transform 0.15s;
    }
    .submit-btn:disabled {
      background: #cbd5e1;
      color: #64748b;
      cursor: not-allowed;
      box-shadow: none;
      opacity: 0.85;
    }
    .secondary-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 44px;
      border-radius: 12px;
      background: #0f172a;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      margin-top: 14px;
      transition: background-color 0.15s;
    }
    .secondary-link:hover {
      background: #1e293b;
    }
    @media (max-width: 480px) {
      body { padding: 12px; }
      .card { padding: 24px 18px; border-radius: 20px; }
      h1 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Mi Conductor · Activación de Cliente</span>

    ${success ? `
      <h1>¡Cuenta Activada!</h1>
      <div class="success-box">
        <div class="success-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 style="font-size:19px; color:#0f172a; margin-bottom:8px;">¡Contraseña guardada exitosamente!</h2>
        <p style="font-size:13.5px; color:#475569; line-height:1.5; margin-bottom:14px;">
          La cuenta de <strong>${safeNombre}</strong> (<strong>${safeCorreo}</strong>) ya se encuentra activa.
        </p>
        <p style="font-size:13px; color:#0f172a; background:#f0fdf4; border:1px solid #bbf7d0; padding:12px; border-radius:12px;">
          Ahora puedes abrir la aplicación móvil <strong>Mi Conductor</strong> e iniciar sesión como <strong>Cliente</strong> con tu correo y tu nueva contraseña.
        </p>
      </div>
      <script>
        (function() {
          var mailTarget = ${JSON.stringify(webmailUrl)};
          try {
            // Reemplazar la entrada del formulario en el historial para que el botón "Atrás" nunca devuelva al formulario
            window.history.replaceState({ activated: true }, document.title, window.location.pathname);
            window.history.pushState({ activatedGuard: true }, document.title, window.location.pathname);
            window.addEventListener('popstate', function() {
              var ref = document.referrer || '';
              if (ref && ref.indexOf('/activar-cuenta') === -1) {
                window.location.replace(ref);
              } else {
                window.location.replace(mailTarget);
              }
            });
          } catch (e) {}
        })();
      </script>
    ` : (tokenInvalid || !userInfo) ? `
      <h1>El enlace ha expirado o no es válido</h1>
      <div class="expired-box">
        <div class="expired-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="error-box" style="text-align:center;">
          El enlace ha expirado o no es válido
        </div>
        <p style="font-size:13px; color:#475569; line-height:1.55; margin-bottom:12px;">
          Por seguridad, los enlaces de activación son de <strong>un solo uso</strong> y tienen una vigencia máxima de <strong>10 minutos</strong>.
        </p>
        <p style="font-size:12.5px; color:#64748b; line-height:1.5; background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:12px;">
          ¿Necesitas un nuevo enlace para establecer tu contraseña? Puedes solicitar uno nuevo desde la opción de recuperación de contraseña o comunicarte con el administrador.
        </p>
        <a href="${recoverUrl}" class="secondary-link">
          Solicitar nuevo enlace de contraseña
        </a>
      </div>
    ` : `
      <h1>Configura tu contraseña</h1>
      <p class="subtitle">Establece tu contraseña segura para activar tu cuenta. Este enlace es de un solo uso y vence a los 10 minutos.</p>

      ${safeError ? `<div class="error-box">${safeError}</div>` : ""}

      <form id="activationForm" method="POST" action="/api/clientes/activar-cuenta" novalidate>
        <input type="hidden" name="token" value="${safeToken}" />
        <div class="user-box">
          <div><strong>Cliente:</strong> ${safeNombre}</div>
          <div style="margin-top:4px;"><strong>Correo de acceso:</strong> ${safeCorreo}</div>
        </div>

        <div class="field">
          <label for="password">Nueva contraseña <span style="color:#ef4444;">*</span></label>
          <div class="input-wrap">
            <input type="password" id="password" name="password" placeholder="Ingresa tu nueva contraseña" autocomplete="new-password" required />
            <button type="button" class="toggle-eye" id="togglePwd" aria-label="Mostrar u ocultar contraseña" title="Mostrar u ocultar contraseña">
              <svg id="eyeOpenPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>

        <div class="strength-box">
          <div class="strength-header">
            <span>Fortaleza de la contraseña:</span>
            <span id="strengthLabel" style="color:#64748b;">Sin evaluar</span>
          </div>
          <div class="strength-bars">
            <div id="bar1" class="strength-bar"></div>
            <div id="bar2" class="strength-bar"></div>
            <div id="bar3" class="strength-bar"></div>
          </div>
        </div>

        <div class="field">
          <label for="confirmPassword">Confirmar contraseña <span style="color:#ef4444;">*</span></label>
          <div class="input-wrap">
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Repite tu contraseña" autocomplete="new-password" required />
            <button type="button" class="toggle-eye" id="toggleConfirm" aria-label="Mostrar u ocultar confirmación" title="Mostrar u ocultar confirmación">
              <svg id="eyeOpenConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>

        <div class="reqs-box">
          <div class="reqs-title">Requisitos de seguridad:</div>
          <div id="req-len" class="req-item"><span class="req-dot">✓</span><span>Mínimo 8 caracteres</span></div>
          <div id="req-upper" class="req-item"><span class="req-dot">✓</span><span>Al menos una letra mayúscula (A-Z)</span></div>
          <div id="req-lower" class="req-item"><span class="req-dot">✓</span><span>Al menos una letra minúscula (a-z)</span></div>
          <div id="req-num" class="req-item"><span class="req-dot">✓</span><span>Al menos un número (0-9)</span></div>
          <div id="req-spec" class="req-item"><span class="req-dot">✓</span><span>Al menos un carácter especial (!@#$%^&*...)</span></div>
          <div id="req-nospace" class="req-item"><span class="req-dot">✓</span><span>Sin espacios en blanco</span></div>
          <div id="req-nopersonal" class="req-item"><span class="req-dot">✓</span><span>No contiene tu nombre, correo ni documento</span></div>
          <div id="req-nocommon" class="req-item"><span class="req-dot">✓</span><span>No es una contraseña común o predecible</span></div>
          <div id="req-match" class="req-item"><span class="req-dot">✓</span><span>Ambas contraseñas coinciden</span></div>
        </div>

        <button type="submit" id="submitBtn" class="submit-btn" disabled>
          Guardar contraseña y activar cuenta
        </button>
      </form>

      <script>
        (function() {
          window.addEventListener('pageshow', function(ev) {
            if (ev.persisted || (window.performance && window.performance.navigation && window.performance.navigation.type === 2)) {
              window.location.reload();
            }
          });
          var ctx = ${clientContextJson};
          var formEl = document.getElementById('activationForm');
          var tokenVal = ${JSON.stringify(token || "")};
          var mailTarget = ${JSON.stringify(webmailUrl)};
          var pwdInput = document.getElementById('password');
          var confirmInput = document.getElementById('confirmPassword');
          var submitBtn = document.getElementById('submitBtn');
          var strengthLabel = document.getElementById('strengthLabel');
          var bar1 = document.getElementById('bar1');
          var bar2 = document.getElementById('bar2');
          var bar3 = document.getElementById('bar3');

          function setupToggle(btnId, inputEl) {
            var btn = document.getElementById(btnId);
            if (!btn || !inputEl) return;
            btn.addEventListener('click', function() {
              var isPwd = inputEl.type === 'password';
              inputEl.type = isPwd ? 'text' : 'password';
              btn.innerHTML = isPwd
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
                : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
            });
          }

          setupToggle('togglePwd', pwdInput);
          setupToggle('toggleConfirm', confirmInput);

          function norm(s) {
            return String(s || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().trim();
          }

          function setReq(id, ok) {
            var el = document.getElementById(id);
            if (!el) return;
            if (ok) el.classList.add('ok');
            else el.classList.remove('ok');
          }

          function evaluate() {
            var pwd = pwdInput.value || '';
            var conf = confirmInput.value || '';
            var hasText = pwd.length > 0;

            var rLen = pwd.length >= 8;
            var rUpper = /[A-ZÁÉÍÓÚÑ]/.test(pwd);
            var rLower = /[a-záéíóúñ]/.test(pwd);
            var rNum = /\\d/.test(pwd);
            var rSpec = /[!@#$%^&*()_+\\-=[\\]{};':"\\\\|,.<>/?\`~¡¿]/.test(pwd);
            var rNoSpace = hasText && !/\\s/.test(pwd);

            var pNorm = norm(pwd);
            var pAlpha = pNorm.replace(/[^a-z0-9]/g, '');

            var isCommon = (ctx.commonPasswords || []).some(function(c) {
              var cNorm = norm(c);
              var cAlpha = cNorm.replace(/[^a-z0-9]/g, '');
              return pNorm === cNorm || (cAlpha.length >= 6 && pAlpha === cAlpha);
            });
            var rNoCommon = hasText && !isCommon;

            var correoNorm = norm(ctx.correo);
            var correoLocal = correoNorm.split('@')[0] || '';
            var docNorm = String(ctx.documento || '').trim().toLowerCase();
            var fullNames = norm((ctx.nombre || '') + ' ' + (ctx.apellido || '') + ' ' + (ctx.nombreCompleto || ''));
            var nameTokens = fullNames.split(/\\s+/).filter(function(t) { return t.length >= 3; });

            var containsPersonal = false;
            if (correoNorm && pNorm.indexOf(correoNorm) !== -1) containsPersonal = true;
            if (correoLocal && correoLocal.length >= 3 && pNorm.indexOf(correoLocal) !== -1) containsPersonal = true;
            if (docNorm && docNorm.length >= 4 && pNorm.indexOf(docNorm) !== -1) containsPersonal = true;
            nameTokens.forEach(function(t) {
              if (pNorm.indexOf(t) !== -1) containsPersonal = true;
            });

            var rNoPersonal = hasText && !containsPersonal;
            var rMatch = hasText && conf.length > 0 && pwd === conf;

            setReq('req-len', rLen);
            setReq('req-upper', rUpper);
            setReq('req-lower', rLower);
            setReq('req-num', rNum);
            setReq('req-spec', rSpec);
            setReq('req-nospace', rNoSpace);
            setReq('req-nopersonal', rNoPersonal);
            setReq('req-nocommon', rNoCommon);
            setReq('req-match', rMatch);

            var coreChecks = [rLen, rUpper, rLower, rNum, rSpec, rNoSpace, rNoPersonal, rNoCommon];
            var passedCount = coreChecks.filter(Boolean).length;

            bar1.style.backgroundColor = '#e2e8f0';
            bar2.style.backgroundColor = '#e2e8f0';
            bar3.style.backgroundColor = '#e2e8f0';

            if (!hasText) {
              strengthLabel.textContent = 'Sin evaluar';
              strengthLabel.style.color = '#64748b';
            } else if (passedCount <= 4 || !rNoCommon || !rNoPersonal) {
              strengthLabel.textContent = 'Débil';
              strengthLabel.style.color = '#dc2626';
              bar1.style.backgroundColor = '#dc2626';
            } else if (passedCount < 8) {
              strengthLabel.textContent = 'Media';
              strengthLabel.style.color = '#d97706';
              bar1.style.backgroundColor = '#f59e0b';
              bar2.style.backgroundColor = '#f59e0b';
            } else {
              strengthLabel.textContent = 'Fuerte';
              strengthLabel.style.color = '#16a34a';
              bar1.style.backgroundColor = '#16a34a';
              bar2.style.backgroundColor = '#16a34a';
              bar3.style.backgroundColor = '#16a34a';
            }

            var allValid = passedCount === 8 && rMatch;
            submitBtn.disabled = !allValid;
          }

          pwdInput.addEventListener('input', evaluate);
          confirmInput.addEventListener('input', evaluate);
          pwdInput.addEventListener('blur', evaluate);
          confirmInput.addEventListener('blur', evaluate);

          if (formEl) {
            formEl.addEventListener('submit', function(e) {
              e.preventDefault();
              if (submitBtn.disabled) return;
              submitBtn.disabled = true;
              submitBtn.textContent = 'Guardando contraseña...';

              fetch('/api/clientes/activar-cuenta', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  token: tokenVal,
                  password: pwdInput.value,
                  confirmPassword: confirmInput.value
                })
              })
              .then(function(res) {
                return res.json().then(function(data) {
                  return { status: res.status, data: data };
                });
              })
              .then(function(result) {
                if (result.status === 200 && result.data && result.data.ok) {
                  // Reemplazar completamente el formulario en el DOM y en el historial
                  var cardEl = document.querySelector('.card');
                  if (cardEl) {
                    cardEl.innerHTML =
                      '<span class="badge">Mi Conductor · Activación de Cliente</span>' +
                      '<h1>¡Cuenta Activada!</h1>' +
                      '<div class="success-box">' +
                        '<div class="success-icon">' +
                          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
                        '</div>' +
                        '<h2 style="font-size:19px; color:#0f172a; margin-bottom:8px;">¡Contraseña guardada exitosamente!</h2>' +
                        '<p style="font-size:13.5px; color:#475569; line-height:1.5; margin-bottom:14px;">' +
                          'La cuenta de <strong>' + (ctx.nombreCompleto || ctx.nombre || 'Cliente') + '</strong> (<strong>' + (ctx.correo || '') + '</strong>) ya se encuentra activa.' +
                        '</p>' +
                        '<p style="font-size:13px; color:#0f172a; background:#f0fdf4; border:1px solid #bbf7d0; padding:12px; border-radius:12px;">' +
                          'Ahora puedes abrir la aplicación móvil <strong>Mi Conductor</strong> e iniciar sesión como <strong>Cliente</strong> con tu correo y tu nueva contraseña.' +
                        '</p>' +
                      '</div>';
                  }

                  try {
                    // Sobrescribir la URL con token en el historial para que el formulario jamás quede en el botón Atrás
                    window.history.replaceState({ activated: true }, document.title, '/api/clientes/activar-cuenta');
                    window.history.pushState({ activatedGuard: true }, document.title, '/api/clientes/activar-cuenta');
                    window.addEventListener('popstate', function() {
                      var ref = document.referrer || '';
                      if (ref && ref.indexOf('/activar-cuenta') === -1) {
                        window.location.replace(ref);
                      } else {
                        window.location.replace(mailTarget);
                      }
                    });
                  } catch (errHist) {}
                } else if (result.status === 401 || result.status === 410) {
                  window.location.reload();
                } else {
                  var msg = (result.data && result.data.message) || 'No se pudo guardar la contraseña.';
                  var existingErr = formEl.parentNode.querySelector('.error-box');
                  if (!existingErr) {
                    existingErr = document.createElement('div');
                    existingErr.className = 'error-box';
                    formEl.parentNode.insertBefore(existingErr, formEl);
                  }
                  existingErr.textContent = msg;
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'Guardar contraseña y activar cuenta';
                }
              })
              .catch(function() {
                formEl.submit();
              });
            });
          }
        })();
      </script>
    `}
  </div>
</body>
</html>`;
    }

}

export default new ClienteController();
