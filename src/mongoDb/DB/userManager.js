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
            if (existingUser) {
                throw new Error("Email is already registered");
            }
            // Verifica si el correo electrónico es "adminCoder@coder.com"
            // y asigna el rol correspondiente
            if (userData.email === "adminCoder@coder.com") {
                userData.role = "admin";
            }

            const cart = await cartManager.createCart({ products: [] })

            const hashedPassword = createHash(userData.password); // Hash de la contraseña
            const newUser = await UserModel.create({ ...userData, password: hashedPassword, cartId: cart._id });
            // al crear el usuario combina userData con la contraseña hasheada y agrega el carrito con su id.
            return newUser;
        } catch (error) {
            return null;
        }
    }

    async login(email, password) {
        try {
            const userExist = await UserModel.findOne({ email });
            if (userExist && isValidPassword(password, userExist.password)) {
                return userExist;
            } else {
                return null;
            }
        } catch (error) {
            console.log("Login failed:", error);
            throw new Error("Login failed");
        }
    }

    async changePassword(email, newPassword) {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                throw new Error("User not found");
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
