import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";
import { env } from "./env.js";

let firebaseApp = null;
let messaging = null;

/**
 * Inicializa Firebase Admin SDK de forma centralizada y segura una sola vez.
 * Admite credenciales desde:
 * 1. Ruta de archivo JSON (FIREBASE_SERVICE_ACCOUNT_PATH).
 * 2. Cadena JSON o Base64 (FIREBASE_SERVICE_ACCOUNT_JSON).
 * 3. Variables de entorno individuales (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).
 */
const initFirebase = () => {
    const apps = getApps();
    if (apps.length > 0) {
        firebaseApp = apps[0];
        try {
            messaging = getMessaging(firebaseApp);
        } catch (_) {
            messaging = null;
        }
        return { firebaseApp, messaging };
    }

    try {
        let credential = null;

        // Opción 1: Archivo JSON de credenciales
        if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            const filePath = path.resolve(env.FIREBASE_SERVICE_ACCOUNT_PATH);
            if (fs.existsSync(filePath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf8"));
                credential = cert(serviceAccount);
            } else {
                console.warn(`[Firebase] Archivo de credenciales no encontrado en: ${filePath}`);
            }
        }

        // Opción 2: Cadena JSON o Base64 en variable de entorno
        if (!credential && env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            try {
                let jsonStr = env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
                if (!jsonStr.startsWith("{")) {
                    jsonStr = Buffer.from(jsonStr, "base64").toString("utf8");
                }
                const serviceAccount = JSON.parse(jsonStr);
                credential = cert(serviceAccount);
            } catch (err) {
                console.warn("[Firebase] Error al parsear FIREBASE_SERVICE_ACCOUNT_JSON:", err.message);
            }
        }

        // Opción 3: Variables individuales
        if (!credential && env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
            const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
            credential = cert({
                projectId: env.FIREBASE_PROJECT_ID,
                clientEmail: env.FIREBASE_CLIENT_EMAIL,
                privateKey
            });
        }

        if (credential) {
            firebaseApp = initializeApp({ credential });
            messaging = getMessaging(firebaseApp);
            console.log("🔥 Firebase Admin SDK inicializado correctamente.");
        } else {
            console.warn(
                "⚠️ [Firebase] Credenciales no configuradas. Las notificaciones push FCM se omitirán pero se guardarán en MongoDB y se emitirán en tiempo real por Socket.IO."
            );
        }
    } catch (error) {
        console.error("❌ [Firebase] Error al inicializar Firebase Admin SDK:", error.message);
    }

    return { firebaseApp, messaging };
};

export const getFirebaseMessaging = () => {
    const apps = getApps();
    if (!firebaseApp && apps.length === 0) {
        initFirebase();
    } else if (!messaging && apps.length > 0) {
        try {
            messaging = getMessaging(apps[0]);
        } catch (_) {
            messaging = null;
        }
    }
    return messaging;
};

export const getFirebaseApp = () => {
    const apps = getApps();
    if (!firebaseApp && apps.length === 0) {
        initFirebase();
    }
    return firebaseApp || (apps.length > 0 ? apps[0] : null);
};

export const isFirebaseConfigured = () => {
    return getFirebaseMessaging() !== null;
};

export default initFirebase;
