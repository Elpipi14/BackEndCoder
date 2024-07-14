import CartsManager from "../mongoDb/DB/carts.Manager.js";
import ProductsManager from "../mongoDb/DB/productsManager.js";
import swal from 'sweetalert';


const productDao = new ProductsManager();
const cartDao = new CartsManager();

export const addToCart = async (req, res) => {
    try {
        // Obtener el productId de los parámetros de la ruta
        const productId = req.params.productId;

        // Obtener la información del usuario autenticado desde req.user
        const user = req.user;

        // Verificar si el usuario está autenticado
        if (!user) {
            // Si el usuario no está autenticado, redirigirlo a la página de inicio de sesión
            return res.redirect('/login');
        }

        // Obtener el producto desde la base de datos
        const product = await productDao.getById(productId);

        // Verificar si el usuario premium intenta agregar su propio producto
        if (product.owner === user._id.toString()) {
            return res.status(403).redirect('/error-addCartPremium?message=You cannot add your own product to your cart.');
        }

        // Obtener el ID del carrito del usuario autenticado (si está disponible en el usuario)
        let cartId = user.cartId;

        // Si el usuario no tiene un carrito, crear uno nuevo
        if (!cartId) {
            const newCart = await cartDao.createCart();
            user.cartId = newCart._id;
            await user.save();
            cartId = newCart._id;
        }

        if (product.stock <= 0) {
            return res.status(200).json({ message: "Stock limit reached", product: product.title });
        }

        // Agregar el producto al carrito del usuario utilizando el ID del carrito y el ID del usuario
        const cart = await cartDao.addToCart(cartId, productId, user._id);
        req.logger.info("Cart after adding product:", cart)

        // Redirigir al usuario al carrito después de agregar el producto
        res.redirect('/cart');
    } catch (error) {
        console.error('Error adding product to cart:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

export const getCart = async (req, res, next) => {
    try {
        if (req.isAuthenticated() && req.user.cartId) {
            const cartId = req.user.cartId;
            const cart = await cartDao.getById(cartId);
            const products = cart.products;

            const productMap = new Map();
            for (const item of products) {
                const productId = item.product;
                const productDetails = await productDao.getById(productId);
                if (productMap.has(productId)) {
                    const existingProduct = productMap.get(productId);
                    existingProduct.quantity += item.quantity;
                } else {
                    productMap.set(productId, {
                        product: productDetails,
                        quantity: item.quantity,
                        _id: item._id
                    });
                }
            }

            const productsWithDetails = Array.from(productMap.values());

            // Pasar el mensaje de error a la vista si está presente en los parámetros de consulta
            res.render('partials/cart', { products: productsWithDetails, cartId: cartId, total: cart.total, error: req.query.error });
        } else {
            res.render('partials/cart', { products: [], total: 0 });
        }
    } catch (error) {
        console.error('Error al obtener productos del carrito:', error.message);
        res.status(500).send('Error interno del servidor');
    }
};


export const getById = async (req, res, next) => {
    try {
        const { cId } = req.params;
        const cart = await cartDao.getById(cId);
        res.status(200).json({ message: "found cart", cart });
    } catch (error) {
        next(error.message);
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const user = req.user;
        const cartId = user.cartId;

        // Eliminar el producto del carrito utilizando el ID del carrito y el ID del producto
        await cartDao.deleteProduct(cartId, productId);

        // Obtener el carrito actualizado
        const cart = await cartDao.getById(cartId);

        // Obtener detalles completos de cada producto
        const productMap = new Map();
        for (const item of cart.products) {
            const productDetails = await productDao.getById(item.product);
            productMap.set(item.product, {
                product: productDetails,
                quantity: item.quantity,
                _id: item._id
            });
        }
        const productsWithDetails = Array.from(productMap.values());

        // Renderizar la vista del carrito pasando los productos con sus detalles y el nuevo total
        res.render('partials/cart', { products: productsWithDetails, cartId: cartId, total: cart.total, alertMessage: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error deleting product from cart:', error.message);
        res.status(500).send('Internal Server Error');
    }
};


export const deleteCart = async (req, res) => {
    try {
        if (req.isAuthenticated() && req.user.cartId) {
            const cartId = req.user.cartId;
            // Utiliza el cartDao para eliminar todos los productos del carrito
            await cartDao.deleteCart(cartId);
        }
        res.redirect('/cart');
    } catch (error) {
        console.error('Error deleting cart:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

export const increaseProductQuantity = async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const cart = await cartDao.increaseQuantity(cartId, productId);
        res.redirect('/cart');
    } catch (error) {
        console.error('Error increasing product quantity:', error.message);

        // Si el error es por falta de stock, redirigir con un mensaje de error
        if (error.message.includes('No stock available for product')) {
            return res.redirect(`/cart?error=No hay más stock disponible para este producto`);
        }

        res.status(500).redirect('/cart');
    }
};


export const decreaseProductQuantity = async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const cart = await cartDao.decreaseQuantity(cartId, productId);
        res.redirect('/cart');
    } catch (error) {
        console.error('Error decreasing product quantity:', error.message);
        res.status(500).json({ error: error.message });
    }
};



