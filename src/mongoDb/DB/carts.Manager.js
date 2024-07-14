import { CartModel } from "../schema/carts.model.js";
import { ProductsModel } from "../schema/products.model.js";

export default class CartsManager {
    // Función para crear un nuevo carrito
    async createCart() {
        try {
            const newCart = new CartModel({
                products: [],
            });
            await newCart.save();
            return newCart;
        } catch (error) {
            console.error(error);
            throw new Error("Error creating cart");
        }
    }

    // Función para agregar un producto al carrito
    async addToCart(cartId, productId) {
        try {
            const product = await ProductsModel.findById(productId);
            if (!product) {
                throw new Error(`Product not found for ID: ${productId}`);
            }

            if (product.stock <= 0) {
                throw new Error(`No stock available for product: ${product.title}`);
            }

            let cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error(`Cart not found for ID: ${cartId}`);
            }

            const existingProduct = cart.products.find(item => item.product.equals(productId));

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({
                    product: productId,
                    quantity: 1
                });
            }

            product.stock -= 1;
            await product.save();

            cart.total = await this.calculateTotal(cart.products);
            cart = await cart.save();
            return cart;
        } catch (error) {
            console.error("Error adding product to cart", error);
            throw error;
        }
    }

    // Función para calcular el total del carrito
    async calculateTotal(products) {
        let total = 0;
        for (const item of products) {
            const product = await ProductsModel.findById(item.product);
            total += item.quantity * product.price;
        }
        return total;
    }


    // Función para obtener todos los carritos
    async getAll() {
        try {
            const carts = await CartModel.find();
            return carts;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    // Función para obtener un carrito por su ID
    async getById(id) {
        try {
            const cart = await CartModel.findById(id);
            return cart;
        } catch (error) {
            console.error("Error searching ID", error);
            throw new Error("Error searching cart by ID");
        }
    }

    // Función para eliminar un producto del carrito
    async deleteProduct(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error(`Cart not found for ID: ${cartId}`);
            }

            const removedProductIndex = cart.products.findIndex(item => item.product.equals(productId));
            if (removedProductIndex === -1) {
                throw new Error(`Product not found in cart`);
            }

            const removedProduct = cart.products[removedProductIndex];
            cart.products.splice(removedProductIndex, 1);

            const product = await ProductsModel.findById(productId);
            if (product) {
                product.stock += removedProduct.quantity;
                await product.save();
            }

            cart.total = await this.calculateTotal(cart.products);
            const updatedCart = await cart.save();
            return updatedCart;
        } catch (error) {
            console.error("Error deleting product from cart", error);
            throw error;
        }
    }


    // Función para vaciar el carrito
    async deleteCart(cartId) {
        try {
            const updatedCart = await CartModel.findByIdAndUpdate(cartId, { $set: { products: [], total: 0 } }, { new: true });
            return updatedCart;
        } catch (error) {
            console.error('Error deleting cart:', error);
            throw error;
        }
    }
    // Función para aumentar la cantidad de un producto en el carrito
    async increaseQuantity(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error(`Cart not found for ID: ${cartId}`);
            }

            const product = await ProductsModel.findById(productId);
            if (!product) {
                throw new Error(`Product not found for ID: ${productId}`);
            }

            const cartProduct = cart.products.find(p => p.product.equals(productId));
            if (!cartProduct) {
                throw new Error(`Product not found in cart`);
            }

            if (product.stock <= 0) {
                throw new Error(`No stock available for product: ${product.title}`);
            }

            cartProduct.quantity += 1;
            product.stock -= 1;

            await product.save();

            cart.total = await this.calculateTotal(cart.products);
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error increasing product quantity in cart:', error);
            throw error;
        }
    }

    // Función para disminuir la cantidad de un producto en el carrito
    async decreaseQuantity(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error(`Cart not found for ID: ${cartId}`);
            }

            const product = await ProductsModel.findById(productId);
            if (!product) {
                throw new Error(`Product not found for ID: ${productId}`);
            }

            const cartProduct = cart.products.find(p => p.product.equals(productId));
            if (!cartProduct) {
                throw new Error(`Product not found in cart`);
            }

            cartProduct.quantity -= 1;
            product.stock += 1;

            if (cartProduct.quantity <= 0) {
                cart.products = cart.products.filter(p => !p.product.equals(productId));
            }

            await product.save();

            cart.total = await this.calculateTotal(cart.products);
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error decreasing product quantity in cart:', error);
            throw error;
        }
    }

}
