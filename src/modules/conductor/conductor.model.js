import mongoose from "mongoose";

const licenciaItemSchema = new mongoose.Schema(
    {
        numero: {
            type: String,
            required: [true, "El número de licencia es obligatorio."],
            trim: true
        },
        categoria: {
            type: String,
            uppercase: true,
            trim: true
        },
        categorias: {
            type: [String],
            default: []
        },
        fechaExpedicion: {
            type: Date
        },
        fechaVencimiento: {
            type: Date
        },
        lugarExpedicion: {
            type: String,
            trim: true
        },
        fotoLicencia: {
            type: String,
            default: null
        }
    },
    { _id: true }
);

const conductorSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: [true, "El usuario es obligatorio."],
            unique: true
        },

        licencia: {
            type: String,
            required: [true, "La licencia es obligatoria."],
            unique: true,
            trim: true
        },

        // Categoría principal (compatibilidad histórica)
        categoriaLicencia: {
            type: String,
            required: [true, "La categoría de la licencia es obligatoria."],
            uppercase: true,
            trim: true
        },

        // Múltiples categorías habilitadas (ej. ['A2', 'B1', 'C1'])
        categoriasLicencia: {
            type: [String],
            default: []
        },

        fechaExpedicion: {
            type: Date,
            required: [true, "La fecha de expedición es obligatoria."]
        },

        fechaVencimiento: {
            type: Date,
            required: [true, "La fecha de vencimiento es obligatoria."]
        },

        licencias: {
            type: [licenciaItemSchema],
            default: []
        },

        // Experiencia profesional declarada por el conductor (en años) - Campo de datos personales
        experiencia: {
            type: Number,
            default: 0,
            min: 0
        },

        // Disponibilidad operativa (Disponible / Fuera de servicio)
        disponible: {
            type: Boolean,
            default: false
        },

        // Estado administrativo (ACTIVO, INACTIVO, RETIRADO, FALLECIDO)
        estadoConductor: {
            type: String,
            enum: ["ACTIVO", "INACTIVO", "RETIRADO", "FALLECIDO"],
            default: "ACTIVO"
        },

        motivoCambioEstado: {
            type: String,
            default: null,
            trim: true
        },

        fechaCambioEstado: {
            type: Date,
            default: null
        },

        usuarioCambioEstado: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            default: null
        },

        // Archivos y fotos
        fotoLicencia: {
            type: String,
            default: null
        },

        fotoPerfil: {
            type: String,
            default: null
        },

        // Compatibilidad booleana histórica
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

// Pre-save hook para sincronizar categoriaLicencia y categoriasLicencia
conductorSchema.pre("save", function () {
    if (this.categoriaLicencia && (!this.categoriasLicencia || this.categoriasLicencia.length === 0)) {
        this.categoriasLicencia = [this.categoriaLicencia.toUpperCase()];
    } else if (this.categoriasLicencia && this.categoriasLicencia.length > 0 && !this.categoriaLicencia) {
        this.categoriaLicencia = this.categoriasLicencia[0].toUpperCase();
    }
    // Sincronizar estado booleano con estado administrativo
    if (this.estadoConductor === "ACTIVO") {
        this.estado = true;
    } else {
        this.estado = false;
        // Si no está activo, no puede estar disponible operativamente
        this.disponible = false;
    }
});

const Conductor = mongoose.model("Conductor", conductorSchema);

export default Conductor;
