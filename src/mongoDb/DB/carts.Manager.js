import { CartModel } from "../schema/carts.model.js";
import { ProductsModel } from "../schema/products.model.js";

export default class CartsManager {

    async createCart() {
        try {
            const newCart = new CartModel({
                // Inicializa el carrito sin productos
                products: [],
            });
            // Guarda el nuevo carrito en la base de datos
            await newCart.save();
            return newCart;
        } catch (error) {
            console.error(error);
            console.error("Error create cart", error);
            throw error;
        }
    }

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

            if (!cart.products) {
                cart.products = [];
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
            console.error("Error add product to cart", error);
            throw error;
        }
    }

    async calculateTotal(products) {
        let total = 0;
        for (const item of products) {
            const product = await ProductsModel.findById(item.product);
            total += item.quantity * product.price;
        }
        return total;
    }

    async getAll() {
        try {
            const carts = await CartModel.find()
            return carts;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getById(id) {
        try {
            //obtener un carrito por su ID con sus productos
            const cart = await CartModel.findById(id);
            return cart;
        } catch (error) {
            console.error("error searching ID", error);
        };
    };

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

    async deleteCart(cartId) {
        try {
            // Elimina el carrito por su ID
            const deletedCart = await CartModel.findByIdAndDelete(cartId);
            return deletedCart;
        } catch (error) {
            console.error("error delete cart", error);
            throw error;
        }
    };

    async deleteCart(cartId) {
        try {
            const updatedCart = await CartModel.findByIdAndUpdate(cartId, { $set: { products: [], total: 0 } }, { new: true });
            return updatedCart;
        } catch (error) {
            console.error('Error deleting cart:', error);
            throw error;
        }
    };

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

            if (cartProduct.quantity <= 1) {
                throw new Error(`Cannot decrease quantity below 1`);
            }

            cartProduct.quantity -= 1;
            product.stock += 1;

            await product.save();

            cart.total = await this.calculateTotal(cart.products);
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error decreasing product quantity in cart:', error);
            throw error;
        }
    }
};

