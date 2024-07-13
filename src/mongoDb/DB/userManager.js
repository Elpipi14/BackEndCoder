import { UserModel } from "../schema/user.model.js";
import { createHash, isValidPassword } from "../../utils/bcryptHash.js";

import CartsManager from "./carts.Manager.js";
const cartManager = new CartsManager()

export default class UserManager {

    async findByEmail(email) {
        try {
            const response = await UserModel.find({ email });
            return response;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    async findById(id) {
        try {
            const response = await UserModel.find({ id });
            return response;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    async register(userData) {
        try {
            const existingUser = await UserModel.findOne({ email: userData.email });

            //vrifica si el usuario email existe
            if (existingUser) {
                throw new Error("Email is already registered");
            }

            //verifica que el password sea mas de 6 caracteres
            if (userData.password.length < 6) {
                throw new Error("Password must be at least 6 characters long");
            }

            // Verifica si el correo electrónico es "adminCoder@coder.com" y asigna el rol correspondiente
            if (userData.email === "adminCoder@coder.com") {
                userData.role = "admin";
            }

            //crear el cart id unico para el usuario
            const cart = await cartManager.createCart({ products: [] })

            //Hashea la constraseña bcrypt
            const hashedPassword = createHash(userData.password);

            //Al crear el usuario combina los datos con la contraseña hasheada y el cart.
            const newUser = await UserModel.create({ ...userData, password: hashedPassword, cartId: cart._id });

            return newUser;
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            const userExist = await UserModel.findOne({ email });

            if (!userExist) {
                throw new Error("Email is not correct");
            }

            if (!isValidPassword(password, userExist.password)) {
                throw new Error("Incorrect password");
            }

            return userExist;
        } catch (error) {
            throw error;
        }
    }

    async changePassword(email, oldPassword, newPassword) {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }

            // Verificar si la contraseña antigua es correcta comparando hashes
            if (!isValidPassword(oldPassword, user.password)) {
                throw new Error("Old password is incorrect");
            }

            //verifica que el password sea mas de 6 caracteres
            if (newPassword.length < 6) {
                throw new Error("Password must be at least 6 characters long");
            }

            // Asegúrate de que la nueva contraseña no es la misma que la antigua
            if (isValidPassword(newPassword, user.password)) {
                throw new Error("New password cannot be the same as the old password");
            }

            user.password = createHash(newPassword);
            await user.save();
            return user;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async forgetPassword(email, newPassword) {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                throw new Error("Email not found");
            }

            if (newPassword.length < 6) {
                throw new Error("Password must be at least 6 characters long");
            }

            // Asegúrate de que la nueva contraseña no es la misma que la antigua
            if (isValidPassword(newPassword, user.password)) {
                throw new Error("New password cannot be the same as the old password");
            }

            user.password = createHash(newPassword);
            await user.save();
            return user;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

}