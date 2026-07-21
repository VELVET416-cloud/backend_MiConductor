import mongoose from "mongoose";

const vehiculoSchema = new mongoose.Schema(
    {
        placa: {
            type: String,
            required: [true, "La placa es obligatoria"],
            unique: true,
            trim: true,
            uppercase: true
        },

        marca: {
            type: String,
            required: [true, "La marca es obligatoria"],
            trim: true
        },

        modelo: {
            type: String,
            required: [true, "El modelo es obligatorio"],
            trim: true
        },

        color: {
            type: String,
            required: [true, "El color es obligatorio"],
            trim: true
        },

        año: {
            type: Number,
            required: [true, "El año es obligatorio"],
            min: 1900,
            max: new Date().getFullYear() + 1
        },

        tipoVehiculo: {
            type: String,
            required: [true, "El tipo de vehículo es obligatorio"],
            trim: true,
        },

        numeroMotor: {
            type: String,
            required: [true, "El número de motor es obligatorio"],
            trim: true,
            unique: true
        },

        numeroChasis: {
            type: String,
            required: [true, "El número de chasis es obligatorio"],
            trim: true,
            unique: true
        },

        soat: {
            type: Date,
            required: [true, "La fecha de vencimiento del SOAT es obligatoria"]
        },

        tecnomecanica: {
            type: Date,
            required: [true, "La fecha de vencimiento de la tecnomecánica es obligatoria"]
        },

        estado: {
            type: String,
            required: true,
            enum: ["ACTIVO", "INACTIVO", "EN_MANTENIMIENTO"],
            default: "ACTIVO"
        },

        conductor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conductor",
            required: true
        },

        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Vehiculo = mongoose.model("Vehiculo", vehiculoSchema);

export default Vehiculo;
