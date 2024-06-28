import { Router } from "express";
import routerUser from "./DB/usersDB.js";
import routerDB from "./DB/productsDB.js";
import routerCartDB from "./DB/cartsDB.js";
import routerTicketDB from "./DB/ticketDB.js";
import routerViews from "./VIEWS/views.js";

const router = Router();

// Configura las rutas
router.use("/", routerUser);
router.use("/", routerDB);
router.use("/cart", routerCartDB);
router.use("/purchase", routerTicketDB);
router.use("/", routerViews);

export default router;