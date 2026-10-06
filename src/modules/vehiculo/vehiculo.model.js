import mongoose from "mongoose";

const vehiculoSchema = new mongoose.Schema(
    {
        cliente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",
            required: [true, "El cliente es obligatorio."]
        },

        marca: {
            type: String,
            required: [true, "La marca es obligatoria."],
            trim: true
        },

        modelo: {
            type: String,
            required: [true, "El modelo es obligatorio."],
            trim: true
        },

        placa: {
            type: String,
            required: [true, "La placa es obligatoria."],
            uppercase: true,
            unique: true,
            trim: true
        },

        numeroChasis: {
            type: String,
            required: [true, "El número de chasis es obligatorio."],
            unique: true,
            trim: true
        },

        color: {
            type: String,
            required: [true, "El color es obligatorio."],
            trim: true
        },

        anio: {
            type: Number,
            required: [true, "El año es obligatorio."]
        },

        tipoVehiculo: {
            type: String,
            required: [true, "El tipo de vehículo es obligatorio."],
            trim: true
        },

        numeroPuertas: {
            type: Number,
            required: [true, "El número de puertas es obligatorio."]
        },

        tipoCombustible: {
            type: String,
            required: [true, "El tipo de combustible es obligatorio."],
            trim: true
        },

        estadoSeguro: {
            type: String,
            required: [true, "El estado del seguro es obligatorio."],
            trim: true
        },

        companiaAseguradora: {
            type: String,
            required: [true, "La compañía aseguradora es obligatoria."],
            trim: true
        },

        fechaRevisionTecnicoMecanica: {
            type: Date,
            default: null
        },

        gpsRastreo: {
            type: Boolean,
            default: false
        },

        airbags: {
            type: Boolean,
            default: false
        },

        frenosAbs: {
            type: Boolean,
            default: false
        },

        camaraTrasera: {
            type: Boolean,
            default: false
        },

        camaraInterior: {
            type: Boolean,
            default: false
        },

        tarjetaCirculacion: {
            type: String,
            default: null
        },

        seguro: {
            type: String,
            default: null
        },

        verificacion: {
            type: String,
            default: null
        },

        certificadoTecnicoMecanica: {
            type: String,
            default: null
        },

        certificadoSoat: {
            type: String,
            default: null
        },

        foto: {
            type: String,
            default: null
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

const Vehiculo = mongoose.model("Vehiculo", vehiculoSchema);

export default Vehiculo;