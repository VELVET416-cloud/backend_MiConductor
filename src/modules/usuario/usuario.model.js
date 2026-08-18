import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
    {
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

        estado: {
            type: Boolean,
            default: true
        },

        rol: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rol",
            required: [true, "El rol es obligatorio."]
        },

        // Recuperación de contraseña
        resetPasswordToken: {
            type: String,
            default: null,
            select: false
        },

        resetPasswordExpires: {
            type: Date,
            default: null,
            select: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario; 