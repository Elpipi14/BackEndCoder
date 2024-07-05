import { Router } from "express";
import * as controller from "../../controllers/products.controllers.js"
import passport from "passport";
const routerDB = Router();

routerDB.get("/", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), controller.getIndex);
routerDB.get("/products", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), controller.getProducts);
routerDB.get("/view/:id", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), controller.getIdProduct);

routerDB.post("/premium/controlpanel", passport.authenticate("jwt", { session: false }), controller.createProductPremium);
routerDB.get("/premium/controlpanel", passport.authenticate("jwt-admin", { session: false }), controller.getProductsPremium);
routerDB.delete("/premium/controlpanel/:id", passport.authenticate("jwt-admin", { session: false }), controller.deleteProductPremium);
routerDB.post("/premium/controlpanel/update/:id", passport.authenticate("jwt-admin", { session: false }), controller.updateProductPremium);
// routerDB.get("/search/:year", controller.getAggregation);
// routerDB.post("/add", controller.createProduct);
// routerDB.put("/update/:id", controller.productUpdate);
// routerDB.delete("/:id", controller.deleteProduct);


export default routerDB;