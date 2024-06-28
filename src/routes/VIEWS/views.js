import { Router } from "express";
import passport from "passport";

import ChatManager from "../../mongoDb/DB/chat.manager.js";
import { getAllTickets } from '../../controllers/ticket.controllers.js';

const routerViews = Router();
const chatManager = new ChatManager();

//Products
routerViews.get('/', passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), async (req, res) => {
    res.render('partials/index');
});

routerViews.get('/products', passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), async (req, res) => {
    res.render('partials/products');
});

routerViews.get('/view/:id', async (req, res) => {
    res.render('partials/view');
});

//admin 
routerViews.get('/admin/controlPanel', passport.authenticate('jwt-admin', { session: false, failureRedirect: "/profile" }), async (req, res) => {
    res.render('partials/controlPanel');
});

routerViews.get('/admin/panelpurchase', passport.authenticate('jwt-admin', { session: false, failureRedirect: "/profile" }), getAllTickets);

routerViews.get('/admin/tickets/:id', passport.authenticate("jwt-admin", { session: false, failureRedirect: "/profile" }), async (req, res) => {
    res.render('partials/panelPurchaseticket');
});

//premium
routerViews.get('/premium/controlpanel', passport.authenticate('jwt-admin', { session: false, failureRedirect: "/profile" }), async (req, res) => {
    res.render('partials/panelPremium');
});

// Carts
routerViews.get('/cart', passport.authenticate("jwt", { session: false }), async (req, res) => {
    res.render('partials/cart');
});

//agrega un producto al carrito
routerViews.get('/cart/add/:productId', passport.authenticate("jwt", { session: false }), async (req, res) => {
    res.redirect('/cart');
});

routerViews.get('/checkout', passport.authenticate("jwt", { session: false }), async (req, res) => {
    res.render('partials/checkout');
});

//tickets de compra
routerViews.get('/viewTicketuser', passport.authenticate("jwt", { session: false }), async (req, res) => {
    res.render('partials/viewTicketuser');
});

routerViews.get('/ticketDetails', passport.authenticate("jwt", { session: false }), async (req, res) => {
    res.render('partials/ticketDetails');
});

//cambio de password
routerViews.get('/changepassword', async (req, res) => {
    res.render('partials/changepassword');
});

routerViews.get('/changepassword-error', async (req, res) => {
    res.render('partials/changepassword-error');
});


///-------chat´s---------///

routerViews.get('/contact', async (req, res) => {
    try {
        // Obtener todos los chats desde el gestor de chats
        const chats = await chatManager.getAllChats();
        // Renderizar la plantilla Handlebars con los chats obtenidos
        res.render('partials/contact', { messages: chats });
    } catch (error) {
        console.error('Error getting chats:', error);
        res.status(500).send('Internal Server Error');
    }
});

routerViews.post('/contact/send', async (req, res) => {
    try {
        const { email, message } = req.body;
        await chatManager.createChat(email, message);
        res.redirect('/contact');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Internal Server Error');
    };
});

//Login
routerViews.get('/login', async (req, res) => {
    res.render('partials/login');
});

routerViews.get('/register-gitHub', passport.authenticate("github", { scope: ["user:email"] }));

routerViews.get('/gitHub', passport.authenticate('github', { failureRedirect: "/login" }), async (req, res) => {
    //La estrategia de GitHub nos retornará el usurio, entonces lo agregamos a nuestro objeto de session: 
    req.session.user = req.user;
    req.session.login = true;
    res.redirect("/profile");
});

//renderizar la vista register
routerViews.get('/register', async (req, res) => {
    res.render('partials/register');
});

// vista profile
routerViews.get('/profile', passport.authenticate("jwt", { session: false }), async (req, res) => {
    res.render('partials/profile');
});

//errores de vistas
routerViews.get('/register-error', async (req, res) => {
    res.render('partials/register-error');
});

routerViews.get('/login-error', async (req, res) => {
    res.render('partials/login-error');
});


export default routerViews;