const apiUrl = 'https://cdn.shopify.com/s/files/1/0564/3685/0790/files/multiProduct.json';
let products = [];
let cart = [];
let searchTerm = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    document.getElementById('searchButton').addEventListener('click', searchProducts);
    document.getElementById('cartButton').addEventListener('click', showCart);
    document.getElementById('showAllButton').addEventListener('click', fetchProducts);
});

function fetchProducts() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            products = data.categories.flatMap(category => category.category_products);
            displayProducts(products);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';

        if (product.image) {
            const slider = document.createElement('div');
            slider.className = 'slider';

            const images = [product.image];
            if (product.second_image && product.second_image !== 'empty') {
                images.push(product.second_image);
            }

            images.forEach((imageSrc, index) => {
                const img = document.createElement('img');
                img.src = imageSrc;
                if (index === 0) img.classList.add('active');
                slider.appendChild(img);
            });

            if (images.length > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'prev';
                prevBtn.textContent = '<';
                prevBtn.addEventListener('click', () => changeSlide(slider, -1));

                const nextBtn = document.createElement('button');
                nextBtn.className = 'next';
                nextBtn.textContent = '>';
                nextBtn.addEventListener('click', () => changeSlide(slider, 1));

                slider.appendChild(prevBtn);
                slider.appendChild(nextBtn);
            }

            productElement.appendChild(slider);
        }

        const title = document.createElement('h3');
        title.innerHTML = highlightPhrases(product.title);
        productElement.appendChild(title);

        const price = document.createElement('p');
        price.innerHTML = `Price: ₹${product.price}`;
        productElement.appendChild(price);

        if (product.compare_at_price) {
            const compareAtPrice = document.createElement('p');
            compareAtPrice.className = 'compare-at-price';
            compareAtPrice.innerHTML = `Compare at: ₹${product.compare_at_price}`;
            productElement.appendChild(compareAtPrice);
        }

        const vendor = document.createElement('p');
        vendor.innerHTML = highlightPhrases(`Vendor: ${product.vendor}`);
        productElement.appendChild(vendor);

        if (product.badge_text) {
            const badge = document.createElement('p');
            badge.className = 'highlight';
            badge.innerHTML = highlightPhrases(product.badge_text);
            productElement.appendChild(badge);
        }

        const addToCartContainer = document.createElement('div');
        addToCartContainer.className = 'add-to-cart-container';

        const quantityControl = document.createElement('div');
        quantityControl.className = 'quantity-control';

        const minusBtn = document.createElement('button');
        minusBtn.textContent = '-';
        minusBtn.addEventListener('click', () => changeQuantity(productElement, -1));

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.value = 1;
        quantityInput.min = 1;

        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.addEventListener('click', () => changeQuantity(productElement, 1));

        quantityControl.appendChild(minusBtn);
        quantityControl.appendChild(quantityInput);
        quantityControl.appendChild(plusBtn);

        const addToCartBtn = document.createElement('button');
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.addEventListener('click', () => addToCart(product, quantityInput.value));

        addToCartContainer.appendChild(quantityControl);
        addToCartContainer.appendChild(addToCartBtn);

        productElement.appendChild(addToCartContainer);

        container.appendChild(productElement);
    });
}


function changeSlide(slider, direction) {
    const images = slider.querySelectorAll('img');
    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    images[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + direction + images.length) % images.length;
    images[currentIndex].classList.add('active');
}

function filterProducts(categoryName) {
    setActiveButton(categoryName);
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const category = data.categories.find(cat => cat.category_name === categoryName);
            displayProducts(category ? category.category_products : []);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function searchProducts() {
    searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.vendor.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

function highlightPhrases(text) {
    const phrasesToHighlight = ['Wedding Special', 'On Offer', 'New Season'];
    let highlightedText = text;

    phrasesToHighlight.forEach(phrase => {
        const regex = new RegExp(`(${phrase})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="highlight">$1</span>');
    });

    return highlightedText;
}

function changeQuantity(productElement, amount) {
    const quantityInput = productElement.querySelector('.quantity-control input');
    let quantity = parseInt(quantityInput.value);
    quantity = Math.max(1, quantity + amount);
    quantityInput.value = quantity;
}

function addToCart(product, quantity) {
    cart.push({ ...product, quantity: parseInt(quantity) });
    updateCartButton();
    alert(`${quantity} of ${product.title} has been added to your cart!`);
}

function updateCartButton() {
    const cartButton = document.getElementById('cartButton');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartButton.innerText = `🛒 (${totalItems})`;
}


            

function showCart() {
    const cartModal = document.createElement('div');
    cartModal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => cartModal.style.display = 'none';

    modalContent.appendChild(closeBtn);

    if (cart.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.innerText = 'Your cart is empty.';
        modalContent.appendChild(emptyMessage);
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';

            // Product Image
            const imgContainer = document.createElement('div');
            imgContainer.className = 'cart-item-image';

            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.title;

            imgContainer.appendChild(img);
            cartItem.appendChild(imgContainer);

            // Product Info
            const itemInfo = document.createElement('div');
            itemInfo.className = 'cart-item-info';

            const itemTitle = document.createElement('p');
            itemTitle.innerText = item.title;
            itemInfo.appendChild(itemTitle);

            const itemQuantity = document.createElement('p');
            itemQuantity.innerText = `Quantity: ${item.quantity}`;
            itemInfo.appendChild(itemQuantity);

            const totalPrice = item.price * item.quantity;
            const itemPrice = document.createElement('p');
            itemPrice.innerText = `Price: ₹${item.price} x ${item.quantity} = ₹${totalPrice}`;
            itemInfo.appendChild(itemPrice);

            cartItem.appendChild(itemInfo);
            modalContent.appendChild(cartItem);
        });
    }

    cartModal.appendChild(modalContent);
    document.body.appendChild(cartModal);
    cartModal.style.display = 'block';

    cartModal.onclick = event => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    };
}



function setActiveButton(categoryName) {
    const buttons = document.querySelectorAll('.buttons button');
    buttons.forEach(button => {
        if (button.textContent === categoryName) {
            button.classList.add('button-active');
        } else {
            button.classList.remove('button-active');
        }
    });
}

function filterProducts(categoryName) {
    setActiveButton(categoryName);
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const category = data.categories.find(cat => cat.category_name === categoryName);
            displayProducts(category ? category.category_products : []);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Add event listeners for buttons to set them as active
document.querySelectorAll('.buttons button').forEach(button => {
    button.addEventListener('click', (event) => {
        const categoryName = event.target.textContent;
        filterProducts(categoryName);
    });
});

