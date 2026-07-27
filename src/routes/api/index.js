import { Router } from "express";

import rolRoutes from "../../modules/rol/rol.routes.js";
import permisoRoutes from "../../modules/permiso/permiso.routes.js";
import usuarioRoutes from "../../modules/usuario/usuario.routes.js";
import clienteRoutes from "../../modules/cliente/cliente.routes.js";
import vehiculoRoutes from "../../modules/vehiculo/vehiculo.routes.js";
import conductorRoutes from "../../modules/conductor/conductor.routes.js";
import solicitudRoutes from "../../modules/solicitud/solicitud.routes.js";
import novedadRoutes from "../../modules/novedad/novedad.routes.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API Mi Conductor funcionando correctamente 🚗"
    });
});

router.use("/roles", rolRoutes);
router.use("/permisos", permisoRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/clientes", clienteRoutes);
router.use("/vehiculos", vehiculoRoutes);
router.use("/conductores", conductorRoutes);
router.use("/solicitudes", solicitudRoutes);
router.use("/novedades", novedadRoutes);

export default router;