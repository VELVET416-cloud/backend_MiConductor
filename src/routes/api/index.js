import { Router } from "express";

import rolRoutes from "../../modules/rol/rol.routes.js";
import permisoRoutes from "../../modules/permiso/permiso.routes.js";
import vehiculoRoutes from "../../modules/vehiculo/vehiculo.routes.js";
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
router.use("/vehiculos", vehiculoRoutes);
router.use("/novedades", novedadRoutes);

export default router;