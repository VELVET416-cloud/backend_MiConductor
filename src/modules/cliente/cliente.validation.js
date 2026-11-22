import AppError from "../../utils/AppError.js";

const ONLY_DIGITS_REGEX = /^\d+$/;
const LETTERS_TILDES_SPACES_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const CELULAR_COLOMBIA_REGEX = /^3\d{9}$/;

const TIPO_VIA_START_REGEX =
    /^(?:calle|carrera|avenida(?:\s+(?:calle|carrera))?|diagonal|transversal|circular|autopista|cl\.?|cra\.?|kr\.?|av\.?|dg\.?|tv\.?)\s+\d+[a-zA-Z]?(?:\s+(?:bis|sur|norte|este|oeste|[a-zA-Z]))*/i;

const DIRECCION_COLOMBIA_FULL_REGEX =
    /^(?:calle|carrera|avenida(?:\s+(?:calle|carrera))?|diagonal|transversal|circular|autopista|cl\.?|cra\.?|kr\.?|av\.?|dg\.?|tv\.?)\s+\d+[a-zA-Z]?(?:\s+(?:bis|sur|norte|este|oeste|[a-zA-Z]))*\s*(?:#|no\.?|nro\.?|n°)\s*\d+[a-zA-Z]?(?:\s+(?:bis|sur|norte|este|oeste|[a-zA-Z]))*\s*(?:-\s*\d+|\s+\d+)\b/i;

export function calcularEdadDesdeFecha(fechaNacimiento) {
    if (!fechaNacimiento) return { error: "La fecha de nacimiento es obligatoria.", edad: null };
    const cleanStr = String(fechaNacimiento).split("T")[0];
    const parts = cleanStr.split("-");
    const fecha =
        parts.length === 3
            ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
            : new Date(fechaNacimiento);

    if (isNaN(fecha.getTime())) {
        return { error: "La fecha de nacimiento no es válida.", edad: null };
    }

    const hoy = new Date();
    const fechaSinHora = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    if (fechaSinHora > hoySinHora) {
        return { error: "La fecha de nacimiento no puede ser futura.", edad: null };
    }

    let edad = hoySinHora.getFullYear() - fechaSinHora.getFullYear();
    const m = hoySinHora.getMonth() - fechaSinHora.getMonth();
    if (m < 0 || (m === 0 && hoySinHora.getDate() < fechaSinHora.getDate())) {
        edad--;
    }

    if (edad > 120) {
        return { error: "La fecha de nacimiento no es válida.", edad };
    }

    if (edad < 18) {
        return {
            error: `El cliente debe ser mayor de 18 años (edad actual: ${edad} años).`,
            edad
        };
    }

    return { error: "", edad };
}

export function validarDireccionColombiana(direccion) {
    const trimmed = (direccion ?? "").toString().trim();
    if (!trimmed) {
        return "La dirección es obligatoria.";
    }
    if (trimmed.length < 5) {
        return "La dirección debe tener mínimo 5 caracteres.";
    }
    if (!/\d/.test(trimmed)) {
        return "La dirección debe incluir numeración (ej. Calle 30 # 20-15).";
    }
    if (!TIPO_VIA_START_REGEX.test(trimmed)) {
        return "La dirección debe iniciar con un tipo de vía válido (Calle, Carrera, Avenida, Diagonal, Transversal, Circular, Autopista, Cl, Cra, Kr, Av, Dg, Tv) seguido de número.";
    }
    if (!/(?:#|no\.?|nro\.?|n°)\s*\d+/i.test(trimmed)) {
        return "La dirección debe contener el número de cruce (# o No.) y el de placa (ej. Calle 30 # 20-15).";
    }
    if (!DIRECCION_COLOMBIA_FULL_REGEX.test(trimmed)) {
        return "Formato de dirección inválido. Debe tener tipo de vía, número, cruce (# o No.) y placa (ej. Calle 30 # 20-15).";
    }
    if (trimmed.length > 200) {
        return "La dirección no puede superar los 200 caracteres.";
    }
    return "";
}

export function validarDatosCliente(datos, { esActualizacion = false } = {}) {
    // Si es una actualización parcial exclusiva de estado o foto (por ejemplo switch de estado o foto desde móvil)
    const keys = Object.keys(datos || {});
    const esSoloFotoOEstado =
        esActualizacion &&
        keys.length > 0 &&
        keys.every((k) => ["foto", "estado"].includes(k));

    if (esSoloFotoOEstado) {
        return;
    }

    // En actualización de cliente, ignorar o rechazar cambios en tipoDocumento y documento
    if (esActualizacion) {
        delete datos.tipoDocumento;
        delete datos.documento;
    }

    // 1. Tipo de documento (solo en creación)
    if (!esActualizacion) {
        const tipo = (datos.tipoDocumento ?? "").toString().trim().toUpperCase();
        if (!tipo) {
            throw new AppError("El tipo de documento es obligatorio.", 400);
        }
        if (tipo === "TI") {
            throw new AppError("El cliente debe ser mayor de 18 años; no se permite Tarjeta de Identidad (TI).", 400);
        }
    }

    // 2. Documento: obligatorio, solo números, 6 a 10 dígitos (solo en creación)
    if (!esActualizacion) {
        const doc = (datos.documento ?? "").toString().trim();
        if (!doc) {
            throw new AppError("El número de documento es obligatorio.", 400);
        }
        if (!ONLY_DIGITS_REGEX.test(doc)) {
            throw new AppError("El documento solo debe contener números.", 400);
        }
        if (doc.length < 6 || doc.length > 10) {
            throw new AppError("El documento debe tener entre 6 y 10 dígitos.", 400);
        }
        datos.documento = doc;
    }

    // 3. Nombre completo: obligatorio, solo letras, tildes, ñ y espacios, mínimo 3 caracteres
    if (!esActualizacion || datos.nombre !== undefined || datos.apellido !== undefined || datos.nombreCompleto !== undefined) {
        const nombreCompleto = (
            datos.nombreCompleto ||
            `${datos.nombre || ""} ${datos.apellido || ""}`
        )
            .toString()
            .trim();

        if (!nombreCompleto) {
            throw new AppError("El nombre completo es obligatorio.", 400);
        }
        if (!LETTERS_TILDES_SPACES_REGEX.test(nombreCompleto)) {
            throw new AppError("El nombre completo solo puede contener letras, tildes, ñ y espacios.", 400);
        }
        if (nombreCompleto.length < 3) {
            throw new AppError("El nombre completo debe tener mínimo 3 caracteres.", 400);
        }
    }

    // 4. Correo: obligatorio, formato válido
    if (!esActualizacion || datos.correo !== undefined) {
        const correo = (datos.correo ?? "").toString().trim().toLowerCase();
        if (!correo) {
            throw new AppError("El correo electrónico es obligatorio.", 400);
        }
        if (!EMAIL_REGEX.test(correo)) {
            throw new AppError("El correo electrónico no tiene un formato válido.", 400);
        }
        datos.correo = correo;
    }

    // 5. Fecha de nacimiento: obligatoria, no futura, mayor de 18 años; calcula Edad automáticamente
    if (!esActualizacion || datos.fechaNacimiento !== undefined) {
        const { error, edad } = calcularEdadDesdeFecha(datos.fechaNacimiento);
        if (error) {
            throw new AppError(error, 400);
        }
        datos.edad = edad;
    }

    // 6. Teléfono: obligatorio, celular colombiano de 10 dígitos que empiece por 3
    if (!esActualizacion || datos.telefono !== undefined) {
        const tel = (datos.telefono ?? "").toString().trim();
        if (!tel) {
            throw new AppError("El teléfono es obligatorio.", 400);
        }
        if (!CELULAR_COLOMBIA_REGEX.test(tel)) {
            throw new AppError("El teléfono debe ser un celular colombiano de 10 dígitos que empiece por 3.", 400);
        }
        datos.telefono = tel;
    }

    // 7. Dirección: obligatoria, formato dirección colombiana
    if (!esActualizacion || datos.direccion !== undefined) {
        const dirError = validarDireccionColombiana(datos.direccion);
        if (dirError) {
            throw new AppError(dirError, 400);
        }
        datos.direccion = datos.direccion.trim();
    }
}

// ======================================================
// VALIDACIÓN DE CONTRASEÑA DE ACTIVACIÓN DE CLIENTE
// ======================================================

export const COMMON_PASSWORDS_CLIENTE = [
    "12345678",
    "123456789",
    "1234567890",
    "password",
    "password1",
    "password123",
    "qwerty123",
    "qwertyuiop",
    "contraseña",
    "contraseña1",
    "contrasena",
    "contrasena1",
    "admin123",
    "admin1234",
    "cliente123",
    "miconductor",
    "miconductor1",
    "colombia1",
    "colombia123",
    "abc12345",
    "11111111",
    "00000000"
];

const normalizeNoAccents = (str = "") =>
    String(str)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

export function validarPasswordActivacionCliente(password, confirmPassword, userInfo = {}) {
    const pwd = String(password ?? "");
    const confirm = confirmPassword !== undefined ? String(confirmPassword ?? "") : pwd;

    if (!pwd) {
        return { valid: false, message: "La contraseña es obligatoria." };
    }

    if (pwd.length < 8) {
        return { valid: false, message: "La contraseña debe tener mínimo 8 caracteres." };
    }

    if (/\s/.test(pwd)) {
        return { valid: false, message: "La contraseña no puede contener espacios." };
    }

    if (!/[A-ZÁÉÍÓÚÑ]/.test(pwd)) {
        return { valid: false, message: "La contraseña debe incluir al menos una letra mayúscula." };
    }

    if (!/[a-záéíóúñ]/.test(pwd)) {
        return { valid: false, message: "La contraseña debe incluir al menos una letra minúscula." };
    }

    if (!/\d/.test(pwd)) {
        return { valid: false, message: "La contraseña debe incluir al menos un número." };
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~¡¿]/.test(pwd)) {
        return {
            valid: false,
            message: "La contraseña debe incluir al menos un carácter especial (!@#$%^&*...)."
        };
    }

    const pwdNorm = normalizeNoAccents(pwd);
    const pwdAlphaNum = pwdNorm.replace(/[^a-z0-9]/g, "");

    const isCommon = COMMON_PASSWORDS_CLIENTE.some((common) => {
        const cNorm = normalizeNoAccents(common);
        const cAlphaNum = cNorm.replace(/[^a-z0-9]/g, "");
        return pwdNorm === cNorm || (cAlphaNum.length >= 6 && pwdAlphaNum === cAlphaNum);
    });

    if (isCommon) {
        return {
            valid: false,
            message: "La contraseña elegida es demasiado común o insegura. Elige una contraseña más segura."
        };
    }

    // No puede contener el correo, el nombre ni el número de documento del cliente
    const correo = normalizeNoAccents(userInfo.correo || "");
    const correoLocal = correo.split("@")[0] || "";
    const documento = String(userInfo.documento || "").trim();
    const nombreCompleto = normalizeNoAccents(
        `${userInfo.nombre || ""} ${userInfo.apellido || ""} ${userInfo.nombreCompleto || ""}`
    );
    const nombreTokens = nombreCompleto
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 3);

    if (correo && pwdNorm.includes(correo)) {
        return {
            valid: false,
            message: "La contraseña no puede contener tu correo electrónico."
        };
    }

    if (correoLocal && correoLocal.length >= 3 && pwdNorm.includes(correoLocal)) {
        return {
            valid: false,
            message: "La contraseña no puede contener tu correo electrónico."
        };
    }

    if (documento && documento.length >= 4 && pwdNorm.includes(documento.toLowerCase())) {
        return {
            valid: false,
            message: "La contraseña no puede contener tu número de documento."
        };
    }

    if (nombreTokens.some((token) => pwdNorm.includes(token))) {
        return {
            valid: false,
            message: "La contraseña no puede contener tu nombre o apellido."
        };
    }

    if (confirmPassword !== undefined && pwd !== confirm) {
        return {
            valid: false,
            message: "La confirmación de la contraseña no coincide."
        };
    }

    return { valid: true, message: "" };
}
