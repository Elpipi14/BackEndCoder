import { Server } from "socket.io";
import ProductsManager from "../mongoDb/DB/productsManager.js";

const productsManager = new ProductsManager();

const initializeSocketAdmin = (httpServer) => {
    const io = new Server(httpServer);

    const emitProducts = async (socket) => {
        try {
            const products = await productsManager.getProductsSocket(); // Obtener todos los productos de la base de datos
            socket.emit('arrayProducts', products); // Emitir productos al cliente específico
        } catch (error) {
            console.error("Error getting products:", error);
        }
    };

    io.on('connection', (socket) => {
        console.log(`Connected client ${socket.id}`);

        // Emitir la lista de productos cuando un cliente se conecta
        emitProducts(socket);

        socket.on('disconnect', () => console.log(`Client disconnected ${socket.id}`));

        socket.on('newProducts', async (product, callback) => {
            try {
                await productsManager.createProduct(product);
                console.log("Product created: ", product);
                callback({ success: true });

                // Emitir la lista actualizada de productos a todos los clientes
                io.emit('arrayProducts', await productsManager.getProductsSocket());
            } catch (error) {
                console.error("Error creating product:", error);
                callback({ error: true, message: "Error creating product" });
            }
        });

        socket.on('deleteProduct', async (productId, callback) => {
            try {
                await productsManager.productDelete(productId);
                console.log("Product deleted: ", productId);
                callback({ success: true });

                // Emitir la lista actualizada de productos a todos los clientes
                io.emit('arrayProducts', await productsManager.getProductsSocket());
            } catch (error) {
                console.error("Error deleting product:", error);
                callback({ error: true, message: "Error deleting product" });
            }
        });

        socket.on('updateProduct', async (productId, updatedProduct, callback) => {
            try {
                await productsManager.updateProduct(productId, updatedProduct);
                console.log("Product updated: ", updatedProduct);
                callback({ success: true });

                // Emitir la lista actualizada de productos a todos los clientes
                io.emit('arrayProducts', await productsManager.getProductsSocket());
            } catch (error) {
                console.error("Error updating product:", error);
                callback({ error: true, message: "Error updating product" });
            }
        });
    });
};

export default initializeSocketAdmin;
