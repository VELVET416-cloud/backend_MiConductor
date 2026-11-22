import AppError from "../../utils/AppError.js";

const PLACA_REGEX = /^(?:[A-Z]{3}[0-9]{3}|[A-Z]{3}[0-9]{2}[A-Z])$/;

function esFechaPosteriorAHoy(fechaValor) {
    if (!fechaValor) return false;
    const cleanStr = String(fechaValor).split("T")[0];
    const parts = cleanStr.split("-");
    const fecha =
        parts.length === 3
            ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
            : new Date(fechaValor);

    if (isNaN(fecha.getTime())) return false;

    const hoy = new Date();
    const fechaSinHora = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    return fechaSinHora.getTime() > hoySinHora.getTime();
}

function esImagenValida(urlOrName) {
    if (!urlOrName || typeof urlOrName !== "string") return false;
    const trimmed = urlOrName.trim();
    if (!trimmed) return false;
    // Acepta URLs de imágenes (Cloudinary / HTTP con extensión o formato válido) o archivos .jpg, .jpeg, .png, .webp
    const pathWithoutQuery = trimmed.split("?")[0].toLowerCase();
    if (/\.(jpg|jpeg|png|webp)$/i.test(pathWithoutQuery)) {
        return true;
    }
    if (/^https?:\/\/res\.cloudinary\.com\/.+\/image\/upload\//i.test(trimmed)) {
        return !/\.(pdf|gif|svg|bmp|tiff|mp4|mov)$/i.test(pathWithoutQuery);
    }
    if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(trimmed)) {
        return true;
    }
    return /^https?:\/\//i.test(trimmed) && !/\.(pdf|doc|docx|xls|xlsx|txt|zip)$/i.test(pathWithoutQuery);
}

export function validarDatosVehiculo(datos, { esActualizacion = false, vehiculoActual = null } = {}) {
    // Si es una actualización parcial exclusiva de estado
    const keys = Object.keys(datos || {});
    const esSoloEstado =
        esActualizacion &&
        keys.length > 0 &&
        keys.every((k) => ["estado", "estadoVehiculo", "motivoCambioEstado"].includes(k));

    if (esSoloEstado) {
        return;
    }

    // 1. Cliente obligatorio
    const cliente = datos.cliente ?? vehiculoActual?.cliente;
    if (!cliente || String(cliente).trim() === "") {
        throw new AppError("El cliente propietario es obligatorio.", 400);
    }

    // 2. Tipo, Marca, Modelo, Color obligatorios
    const tipoVehiculo = (datos.tipoVehiculo ?? vehiculoActual?.tipoVehiculo ?? "").toString().trim();
    if (!tipoVehiculo) {
        throw new AppError("El tipo de vehículo es obligatorio.", 400);
    }

    const marca = (datos.marca ?? vehiculoActual?.marca ?? "").toString().trim();
    if (!marca) {
        throw new AppError("La marca del vehículo es obligatoria.", 400);
    }

    const modelo = (datos.modelo ?? vehiculoActual?.modelo ?? "").toString().trim();
    if (!modelo) {
        throw new AppError("El modelo del vehículo es obligatorio.", 400);
    }

    const color = (datos.color ?? vehiculoActual?.color ?? "").toString().trim();
    if (!color) {
        throw new AppError("El color del vehículo es obligatorio.", 400);
    }

    // 3. Placa: obligatoria, mayúsculas, formato ABC123 (carro) o ABC12D (moto)
    const placaRaw = (datos.placa ?? vehiculoActual?.placa ?? "").toString().trim().toUpperCase();
    if (!placaRaw) {
        throw new AppError("La placa del vehículo es obligatoria.", 400);
    }
    if (!PLACA_REGEX.test(placaRaw)) {
        throw new AppError(
            "La placa debe estar en mayúsculas y tener formato ABC123 (carro) o ABC12D (moto).",
            400
        );
    }
    if (datos.placa !== undefined) {
        datos.placa = placaRaw;
    }

    // 4. Año: obligatorio, 4 dígitos, entre 1980 y año actual + 1
    const anioVal = datos.anio ?? vehiculoActual?.anio;
    const anioStr = String(anioVal ?? "").trim();
    if (!anioStr || !/^\d{4}$/.test(anioStr)) {
        throw new AppError("El año del vehículo es obligatorio y debe tener 4 dígitos.", 400);
    }
    const anioNum = Number(anioStr);
    const anioMaximo = new Date().getFullYear() + 1;
    if (anioNum < 1980 || anioNum > anioMaximo) {
        throw new AppError(`El año del vehículo debe estar entre 1980 y ${anioMaximo}.`, 400);
    }
    if (datos.anio !== undefined) {
        datos.anio = anioNum;
    }

    // 5. Vencimiento SOAT y Tecnomecánica: obligatorios y posteriores a hoy
    const fechaSoat = datos.fechaVencimientoSoat ?? vehiculoActual?.fechaVencimientoSoat;
    if (!fechaSoat) {
        throw new AppError("La fecha de vencimiento del SOAT es obligatoria.", 400);
    }
    if (!esFechaPosteriorAHoy(fechaSoat)) {
        throw new AppError("La fecha de vencimiento del SOAT debe ser posterior a hoy.", 400);
    }

    const fechaTecno =
        datos.fechaVencimientoTecnomecanica ??
        datos.fechaRevisionTecnicoMecanica ??
        vehiculoActual?.fechaVencimientoTecnomecanica ??
        vehiculoActual?.fechaRevisionTecnicoMecanica;
    if (!fechaTecno) {
        throw new AppError("La fecha de vencimiento de la tecnomecánica es obligatoria.", 400);
    }
    if (!esFechaPosteriorAHoy(fechaTecno)) {
        throw new AppError("La fecha de vencimiento de la tecnomecánica debe ser posterior a hoy.", 400);
    }

    // 6. Tarjeta de propiedad: obligatoria, JPG/PNG/WEBP
    const tarjeta =
        datos.tarjetaPropiedad ??
        datos.tarjetaCirculacion ??
        vehiculoActual?.tarjetaPropiedad ??
        vehiculoActual?.tarjetaCirculacion;
    if (!tarjeta || !esImagenValida(tarjeta)) {
        throw new AppError(
            "La tarjeta de propiedad es obligatoria y debe ser una imagen JPG, PNG o WEBP.",
            400
        );
    }

    // 7. Fotos: mínimo 1, máximo 3, JPG/PNG/WEBP
    let listaFotos = [];
    if (Array.isArray(datos.fotos) && datos.fotos.filter(Boolean).length > 0) {
        listaFotos = datos.fotos.filter(Boolean);
    } else if (datos.foto1 || datos.foto2 || datos.foto3 || datos.foto) {
        listaFotos = [datos.foto1, datos.foto2, datos.foto3].filter(Boolean);
        if (listaFotos.length === 0 && datos.foto) {
            listaFotos = [datos.foto];
        }
    } else if (vehiculoActual) {
        if (Array.isArray(vehiculoActual.fotos) && vehiculoActual.fotos.filter(Boolean).length > 0) {
            listaFotos = vehiculoActual.fotos.filter(Boolean);
        } else {
            listaFotos = [vehiculoActual.foto1, vehiculoActual.foto2, vehiculoActual.foto3, vehiculoActual.foto].filter(Boolean);
        }
    }

    if (listaFotos.length < 1 || listaFotos.length > 3) {
        throw new AppError("El vehículo debe tener mínimo 1 y máximo 3 fotos.", 400);
    }
    if (!listaFotos.every((f) => esImagenValida(f))) {
        throw new AppError("Todas las fotos del vehículo deben estar en formato JPG, PNG o WEBP.", 400);
    }
}
