import { Router } from "express";
import * as controller from "../../controllers/carts.controllers.js"
import passport from "passport";
const routerCartDB = Router();

routerCartDB.get("/", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), controller.getCart);
routerCartDB.post("/add/:productId", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), controller.addToCart);
routerCartDB.delete('/delete/:productId', passport.authenticate("jwt", { session: false }), controller.deleteProduct);
// routerCartDB.delete("/deleteId/:cId", passport.authenticate("jwt", { session: false }), controller.deleteCart);
routerCartDB.post('/increase/:cartId/:productId', controller.increaseProductQuantity);
routerCartDB.post('/decrease/:cartId/:productId', controller.decreaseProductQuantity);


export default routerCartDB;