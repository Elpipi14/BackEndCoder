import { Server } from "socket.io";
import ProductsManager from "../mongoDb/DB/productsManager.js";
import UserManager from "../mongoDb/DB/userManager.js";

const productsManager = new ProductsManager();
const userManager = new UserManager();

const initializeSocketPremium = (httpServer) => {
    const io = new Server(httpServer);

    const emitProducts = async (socket) => {
        try {
            const products = await productsManager.getProductsSocket(); // Obtener todos los productos de la base de datos
            socket.emit('arrayProductsPremium', products); // Emitir productos al cliente específico
        } catch (error) {
            console.error("Error getting products:", error);
        }
    };

    io.on('connection', (socket) => {
        console.log(`Connected client ${socket.id}`);

        // Emitir la lista de productos cuando un cliente se conecta
        emitProducts(socket);

        socket.on('disconnect', () => console.log(`Client disconnected ${socket.id}`));

        socket.on('newProductsPremium', async (product, callback) => {
            try {
                const user = await userManager.findById(socket.id); // Obtener el usuario a partir del socket.id
                if (!user || user.role !== 'premium') {
                    throw new Error('Only premium users can create products');
                }

                // Asignar owner como 'admin' si no se especifica
                product.owner = product.owner || 'admin';

                await productsManager.createProduct(product);
                console.log("Product created: ", product);
                callback({ success: true });

                // Emitir la lista actualizada de productos a todos los clientes
                io.emit('arrayProductsPremium', await productsManager.getProductsSocket());
            } catch (error) {
                console.error("Error creating product:", error);
                callback({ error: true, message: "Error creating product" });
            }
        });

        socket.on('deleteProductPremium', async (productId, callback) => {
            try {
                const user = await userManager.findById(socket.id);
                const product = await productsManager.getProductById(productId);

                if (!user || (user.role !== 'admin' && user.email !== product.owner)) {
                    throw new Error('Unauthorized to delete this product');
                }

                await productsManager.productDelete(productId);
                console.log("Product deleted: ", productId);
                callback({ success: true });

                // Emitir la lista actualizada de productos a todos los clientes
                io.emit('arrayProductsPremium', await productsManager.getProductsSocket());
            } catch (error) {
                console.error("Error deleting product:", error);
                callback({ error: true, message: "Error deleting product" });
            }
        });

        socket.on('updateProductPremium', async (productId, updatedProduct, callback) => {
            try {
                const user = await userManager.findById(socket.id);
                const product = await productsManager.getProductById(productId);

                if (!user || (user.role !== 'admin' && user.email !== product.owner)) {
                    throw new Error('Unauthorized to update this product');
                }

                await productsManager.updateProduct(productId, updatedProduct);
                console.log("Product updated: ", updatedProduct);
                callback({ success: true });

                // Emitir la lista actualizada de productos a todos los clientes
                io.emit('arrayProductsPremium', await productsManager.getProductsSocket());
            } catch (error) {
                console.error("Error updating product:", error);
                callback({ error: true, message: "Error updating product" });
            }
        });
    });
};

export default initializeSocketPremium;
