import mongoose from "mongoose";

const tiposNovedad = [
    // Prioridad Alta
    "ACCIDENTE",
    "FALLA_MECANICA_GRAVE",
    "FALLA_MECANICA",
    "EMERGENCIA_MEDICA",
    "ROBO_ASALTO",
    "BLOQUEO_TOTAL_VIA",
    "MECANICA",

    // Prioridad Media
    "TRAFICO_PESADO",
    "CONTROLES_RETENES",
    "RETEN_AUTORIDAD",
    "CAMBIO_RUTA",
    "DESVIO_OBRAS",
    "CLIMA_ADVERSO",
    "PINCHAZO_LLANTA",
    "VIAL",
    "CLIENTE",

    // Prioridad Baja
    "TRAFICO_LEVE",
    "GASOLINA_BAJA",
    "COMBUSTIBLE_BAJO",
    "RETRASO_CLIENTE",
    "PARADA_NO_PROGRAMADA",
    "INFO_RUTA",
    "ADMINISTRATIVA",

    // Opción Otro
    "OTRO",
    "OTROS"
];

const severidadesNovedad = [
    "BAJA",
    "MEDIA",
    "ALTA",
    "CRITICA",
    "URGENTE"
];

const estadosNovedad = [
    "POR_REVISAR",
    "REVISADO",
    "RESUELTO",
    "CERRADO",
    "PENDIENTE",
    "EN_ATENCION",
    "RESUELTA",
    "CERRADA"
];

const novedadSchema = new mongoose.Schema(
    {
        titulo: {
            type: String,
            default: "Novedad en ruta",
            trim: true,
            maxlength: 200
        },

        descripcion: {
            type: String,
            required: [true, "La descripción de la novedad es obligatoria."],
            trim: true,
            maxlength: 1000
        },

        tipo: {
            type: String,
            required: [true, "El tipo de novedad es obligatorio."],
            enum: {
                values: tiposNovedad,
                message: "El tipo de novedad no es válido."
            },
            trim: true,
            uppercase: true
        },

        severidad: {
            type: String,
            required: [true, "La severidad de la novedad es obligatoria."],
            enum: {
                values: severidadesNovedad,
                message: "La severidad de la novedad no es válida."
            },
            trim: true,
            uppercase: true
        },

        motivoOtro: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null
        },

        solicitud: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Solicitud",
            default: null
        },

        conductor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conductor",
            default: null
        },

        usuarioRegistro: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: [true, "El usuario que registra la novedad es obligatorio."]
        },

        estadoNovedad: {
            type: String,
            required: true,
            enum: {
                values: estadosNovedad,
                message: "El estado de la novedad no es válido."
            },
            default: "POR_REVISAR",
            trim: true,
            uppercase: true
        },

        // Geolocalización requerida y enviada por el sistema móvil
        ubicacion: {
            lat: {
                type: Number,
                default: null
            },
            lng: {
                type: Number,
                default: null
            },
            direccion: {
                type: String,
                trim: true,
                default: null
            }
        },

        // Trazabilidad de ruta inicial y nueva ruta (especialmente en Cambio de ruta)
        rutaInicial: {
            origen: {
                type: String,
                trim: true,
                default: null
            },
            destino: {
                type: String,
                trim: true,
                default: null
            },
            coordenadas: {
                type: Array,
                default: []
            },
            polyline: {
                type: String,
                default: null
            }
        },

        rutaNueva: {
            origen: {
                type: String,
                trim: true,
                default: null
            },
            destino: {
                type: String,
                trim: true,
                default: null
            },
            coordenadas: {
                type: Array,
                default: []
            },
            polyline: {
                type: String,
                default: null
            }
        },

        fechaCierre: {
            type: Date,
            default: null
        },

        observaciones: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: null
        },

        notasResolucion: {
            type: String,
            trim: true,
            maxlength: 1500,
            default: null
        },

        historialNotas: [
            {
                autor: {
                    type: String,
                    default: "Administrador"
                },
                usuario: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Usuario",
                    default: null
                },
                estadoAnterior: {
                    type: String,
                    default: null
                },
                nuevoEstado: {
                    type: String,
                    default: null
                },
                nota: {
                    type: String,
                    required: true,
                    trim: true
                },
                fecha: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        evidenciaUrl: {
            type: String,
            trim: true,
            default: null
        },

        fotosEvidencia: {
            type: [String],
            default: []
        },

        estado: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Novedad = mongoose.model("Novedad", novedadSchema);

export { tiposNovedad, severidadesNovedad, estadosNovedad };
export default Novedad;
