import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
    {
        nombreCompleto: {
            type: String,
            trim: true
        },

        nombre: {
            type: String,
            required: [true, "El nombre es obligatorio."],
            trim: true
        },

        apellido: {
            type: String,
            required: [true, "El apellido es obligatorio."],
            trim: true
        },

        tipoDocumento: {
            type: String,
            required: [true, "El tipo de documento es obligatorio."],
            enum: {
                values: ["CC", "TI", "CE", "PPT", "PA", "PAS", "PASAPORTE"],
                message: "Tipo de documento no válido. Debe ser CC, TI, CE, PPT o Pasaporte."
            },
            uppercase: true,
            trim: true
        },

        documento: {
            type: String,
            required: [true, "El número de documento es obligatorio."],
            unique: true,
            trim: true
        },

        correo: {
            type: String,
            required: [true, "El correo es obligatorio."],
            unique: true,
            lowercase: true,
            trim: true
        },

        fechaNacimiento: {
            type: Date,
            default: null
        },

        edad: {
            type: Number,
            default: null
        },

        password: {
            type: String,
            required: [true, "La contraseña es obligatoria."],
            select: false
        },

        resetPasswordToken: {
            type: String,
            default: null,
            select: false
        },

        resetPasswordExpires: {
            type: Date,
            default: null,
            select: false
        },

        telefono: {
            type: String,
            required: [true, "El teléfono es obligatorio."],
            trim: true
        },

        isActivated: {
            type: Boolean,
            default: false
        },

        activationToken: {
            type: String,
            default: null,
            select: false
        },

        activationTokenExpires: {
            type: Date,
            default: null,
            select: false
        },

        estado: {
            type: Boolean,
            default: true
        },

        rol: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rol",
            required: [true, "El rol es obligatorio."]
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

usuarioSchema.index({ tipoDocumento: 1, documento: 1 }, { unique: true });

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
