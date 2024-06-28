document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const url = button.parentElement.action;
            updateQuantity(url, button);
        });
    });

    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const url = button.parentElement.action;
            updateQuantity(url, button);
        });
    });
});

async function updateQuantity(url, button) {
    try {
        const response = await fetch(url, {
            method: 'POST'
        });
        const data = await response.json();
        if (response.ok) {
            const quantityElement = button.closest('.cart-item').querySelector('.quantity');
            quantityElement.textContent = data.newQuantity;
            const priceElement = button.closest('.cart-item').querySelector('.price');
            priceElement.textContent = data.newPrice + ' $';
        } else {
            console.error('Failed to update quantity:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}