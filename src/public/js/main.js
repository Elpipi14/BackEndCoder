const socketClient = io();

// Elementos del formulario y de la lista de productos en el DOM
const form = document.getElementById('form');
const inputYear = document.getElementById('year');
const inputTitle = document.getElementById('title');
const inputDescription = document.getElementById('description');
const inputPrice = document.getElementById('price');
const inputStock = document.getElementById('stock');
const inputImageUrl = document.getElementById('imageUrl');
const inputCode = document.getElementById('code');
const inputCategory = document.getElementById('category');

const productList = document.getElementById('home');

// Manejar el evento de envío del formulario
form.onsubmit = (e) => {
    e.preventDefault();
    const year = inputYear.value;
    const title = inputTitle.value;
    const description = inputDescription.value;
    const price = inputPrice.value;
    const stock = inputStock.value;
    const imageUrl = inputImageUrl.value;
    const code = inputCode.value;
    const category = inputCategory.value;

    const product = { title, description, price, stock, imageUrl, code, category, year };

    socketClient.emit('newProducts', product, (response) => {
        if (response.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Product added successfully'
            });
            form.reset(); // Limpia los campos del formulario
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || "Error adding the product"
            });
        }
    });
};

//actualización de la lista de productos // eliminacion y modificacion productos
socketClient.on('arrayProducts', (updatedProducts) => {
    let productListHTML = '';
    updatedProducts.forEach(e => {
        productListHTML +=
            `<div class="card" style="width: 18rem;">
                <img src="${e.imageUrl}" class="mx-auto img-thumbnail img" alt="${e.title}">
                <div class="card_info card-body">
                    <h2 class="card-text">${e.title}</h2>
                    <p class="card-text">${e.description}</p>
                    <p class="card-text">Price: ${e.price}</p>
                    <p class="card-text">Stocks: ${e.stock}</p>
                    <p class="card-text">Category: ${e.category}</p>
                    <p class="card-text">owner: ${e.owner}</p>
                </div>
                <div class="update">
                    <button class="btn cart px-auto update" id="${e._id}">Update</button>
                </div>
                <div class="delete">
                    <button class="btn cart px-auto delete" id="${e._id}">Delete</button>
                </div>
            </div>`;
    });
    productList.innerHTML = productListHTML;

    // Eliminar producto
    document.querySelectorAll('.delete').forEach(button => {
        button.onclick = () => {
            const productId = button.id;
            if (productId) {
                socketClient.emit('deleteProduct', productId, (response) => {
                    if (response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Product deleted successfully'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: response.message || "Error deleting the product"
                        });
                    }
                });
            } else {
                console.error("Product ID is empty");
            }
        };
    });


    //boton de actualización de producto
    document.querySelectorAll('.update').forEach(button => {
        button.onclick = () => {
            const productId = button.id;
            const product = updatedProducts.find(p => p._id === productId);

            if (product) {
                Swal.fire({
                    title: 'Update Product',
                    html: `
                    <div class="adm-container">
                        <div class="form-group">
                            <label for="updateTitle">Title:</label>
                            <input type="text" id="updateTitle" class="swal2-input" placeholder="Title" value="${product.title}">
                        </div>
                        <div class="form-group">
                            <label for="updateDescription">Description:</label>
                            <input type="text" id="updateDescription" class="swal2-input" placeholder="Description" value="${product.description}">
                        </div>
                        <div class="form-group">
                            <label for="updatePrice">Price:</label>
                            <input type="number" id="updatePrice" class="swal2-input" placeholder="Price" value="${product.price}">
                        </div>
                        <div class="form-group">
                            <label for="updateStock">Stock:</label>
                            <input type="number" id="updateStock" class="swal2-input" placeholder="Stock" value="${product.stock}">
                        </div>
                        <div class="form-group">
                            <label for="updateCategory">Category:</label>
                            <input type="text" id="updateCategory" class="swal2-input" placeholder="Category" value="${product.category}">
                        </div>
                        <div class="form-group">
                            <label for="updateImageUrl">Image URL:</label>
                            <input type="url" id="updateImageUrl" class="swal2-input" placeholder="Image URL" value="${product.imageUrl}">
                        </div>
                        <div class="form-group">
                            <label for="updateCode">Code:</label>
                            <input type="text" id="updateCode" class="swal2-input" placeholder="Code" value="${product.code}">
                        </div>
                        <div class="form-group">
                            <label for="updateYear">Year:</label>
                            <input type="text" id="updateYear" class="swal2-input" placeholder="Year" value="${product.year}">
                        </div>
                    </div>
                    `,
                    focusConfirm: false,
                    preConfirm: () => {
                        return {
                            title: document.getElementById('updateTitle').value,
                            description: document.getElementById('updateDescription').value,
                            price: document.getElementById('updatePrice').value,
                            stock: document.getElementById('updateStock').value,
                            category: document.getElementById('updateCategory').value,
                            imageUrl: document.getElementById('updateImageUrl').value,
                            code: document.getElementById('updateCode').value,
                            year: document.getElementById('updateYear').value
                        };
                    }
                }).then(result => {
                    if (result.isConfirmed) {
                        const updatedProduct = result.value;
                        if (productId) {
                            socketClient.emit('updateProduct', productId, updatedProduct, (response) => {
                                if (response.success) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Success',
                                        text: 'Product updated successfully'
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error',
                                        text: response.message || "Error updating the product"
                                    });
                                }
                            });
                        } else {
                            console.error("Product ID is empty");
                        }
                    }
                });
            } else {
                console.error("Product not found for the given ID");
            }
        }
    })
});










