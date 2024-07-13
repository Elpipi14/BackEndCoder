import { Router } from "express";
import * as controller from "../../controllers/users.controllers.js";
import passport from "passport";
const routerUser = Router();

routerUser.post('/register', controller.register);

routerUser.post("/login", controller.login);

routerUser.get("/profile", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), controller.profile);

routerUser.get("/logout", controller.logOut);

routerUser.post('/change-password', passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), controller.changePassword);

routerUser.post('/request-password-change', controller.requestPasswordChange);

routerUser.post('/forgot-password', controller.forgotPassword);

export default routerUser;
