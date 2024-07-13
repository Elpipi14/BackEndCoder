import UserManager from "../mongoDb/DB/userManager.js";
const userService = new UserManager();
import jwt from 'jsonwebtoken';
import transporter from '../utils/nodemailer.js'; // Importa tu configuración de nodemailer
import configObject from '../config/config.js';

const { private_key } = configObject;

import generationToken from "../utils/jwt.js";
import CustomError from "../helpers/errors/custom-error.js";
import genInfoError from "../helpers/errors/info.js";
import { EErrors } from "../helpers/errors/enum.js";

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        req.logger.info(`Registration attempt with email: ${email}`);

        const isRegistered = await userService.register({ email, password, ...req.body });

        // Verifica si isRegistered no es undefined y tiene la propiedad email
        if (isRegistered && isRegistered.email) {
            // Genera el token JWT con el email del usuario registrado
            generationToken({ email: isRegistered.email }, res);

            req.logger.info("Successfully registered user. Redirecting to Login");
            return res.redirect("/logOut");
        } else {
            // Si el usuario no está registrado correctamente, lanza un error
            req.logger.error("Error during registration");
            return res.status(400).redirect("/register-error");
        }
    } catch (error) {
        req.logger.warning(`Error during registration: ${error.message}`);
        return res.status(500).redirect(`/register-error?message=${encodeURIComponent(error.message)}`);
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userService.login(email, password);

        if (!user) {
            req.logger.warning("Login process error");
            res.status(400).redirect("/login-error?message=Login failed");
        } else {
            generationToken({ user }, res);

            if (!req.session || !req.session.email) {
                req.session = req.session || {};
                req.session.email = email;
                req.session.firstName = user.first_name;
                req.session.user = user;
            }
            req.session.welcomeMessage = `Bienvenido, ${user.first_name} ${user.last_name}!`;
            req.logger.info(`Welcome message in session: ${req.session.welcomeMessage}`);
            res.redirect("/");
        }
    } catch (error) {
        req.logger.warning(`Login process error: ${error.message}`);
        return res.status(500).redirect(`/login-error?message=${encodeURIComponent(error.message)}`);
    }
};

export const profile = async (req, res) => {
    try {
        const user = req.user;

        if (user) {
            const userProfile = {
                ...user._doc,
                isAdmin: user.role === 'admin',
                isPremium: user.role === 'premium'
            };

            res.render('partials/profile', { user: userProfile });
        } else {
            // Redirige al cliente al login con un mensaje
            req.logger.warning('User not authenticated');
            res.status(401).json({ message: 'User not authenticated' });
        }
    } catch (error) {
        console.error('Error found user', error);
        res.status(500).redirect('/login');
    }
};

export const logOut = async (req, res) => {
    // Destruye la sesión del usuario
    req.logger.info(`LogOut`)
    res.clearCookie("coderHouseToken");
    res.redirect("/login");
};

export const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword, oldPassword } = req.body;
        const email = req.user.email; // Asegúrate de que `req.user` está disponible y contiene el email

        // Verifica que la nueva contraseña y la confirmación coincidan
        if (newPassword !== confirmPassword) {
            return res.status(400).redirect("/changepassword-error?message=New passwords not match");
        }

        // Cambia la contraseña del usuario
        await userService.changePassword(email, oldPassword, newPassword); // Asegúrate de que los parámetros están en el orden correcto

        req.logger.info("Successfully changed password");
        res.clearCookie("coderHouseToken");

        return res.redirect("/login?message=Password changed successfully");
    } catch (error) {
        console.error('Error changing password:', error.message);
        return res.status(500).redirect(`/changepassword-error?message=${encodeURIComponent(error.message)}`);
    }
};


export const requestPasswordChange = async (req, res) => {
    try {
        const { email } = req.body;

        // Verifica si el usuario existe
        const user = await userService.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Genera un token JWT con expiración de 1 hora
        const token = jwt.sign({ email }, private_key, { expiresIn: '1h' });

        // URL de cambio de contraseña
        const changePasswordUrl = `http://localhost:8080/forgot-password?token=${token}`;

        // Opciones del correo
        const mailOptions = {
            from: `Sneakers shop <${configObject.email_user}>`,
            to: email,
            subject: 'Password Change Request',
            template: 'emailPassword',
            context: {
                changePasswordUrl,
            }
        };

        // Enviar correo electrónico
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error.message);
                return res.status(500).json({ error: 'Internal server error' });
            } else {
                req.logger.info("Successfully sent password change email. Redirecting to profile");
                return res.redirect("/login?message=Email sent to change password");
            }
        });
    } catch (error) {
        console.error('Error sending password change email:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Verifica que las contraseñas nuevas coincidan
        if (newPassword !== confirmPassword) {
            return res.status(400).redirect("/changepassword-error?message=New passwords do not match");
        }

        // Cambia la contraseña del usuario
        await userService.forgetPassword(email, newPassword);

        req.logger.info("Successfully changed password. Redirecting to Login");
        res.clearCookie("coderHouseToken");

        return res.redirect("/login?message=Password changed successfully");
    } catch (error) {
        console.error('Error changing password:', error.message);
        return res.status(500).redirect(`/forgot-error?message=${encodeURIComponent(error.message)}`);
    }
};


