

// Contentful CMS
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "m2z72uvohsnc",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "2N1L8FuQIEqU2Y3VOwPJ6mc3oYwVOxs6wR7wWStnJk0"
  });

const productListings = document.getElementById('productListings');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartOverlay = document.querySelector('.cart-overlay');
const cartUI = document.querySelector('.cart');
const cartContents = document.getElementById('cart-contents');
const clearCart = document.getElementById('clear-cart');

const cartNumberOfItems = document.getElementById('cart-number-of-items');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTax = document.getElementById('cart-tax');
const cartTotal = document.getElementById('cart-total');
const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
const cartEmptyMessage = document.getElementById('cart-empty-message');

const mobileMenu = document.querySelector('.nav-mobile-icon');
const closeNavBar = document.getElementById('close-nav-icon');
const navBar = document.querySelector('.navBar');
const navLinks = document.querySelector('.nav-links');

const searchBar = document.getElementById('searchFilter');
const categoryContainer = document.getElementById('categories');

const categories = ['Health', 'Shield', 'Fish', 'Misc'];

// Backend Cart
class Cart {
    contents = [];
    taxRate = 0.0725;

    subtotal = 0;
    tax = 0;
    total = 0;
    numberOfItems = 0;

// ----- METHODS ----- Change to accept product object from app mgr class (for optimization)

// Add item to cart by id and specifed amount
    addItem(product, amount) {
        product.amount = amount;
        this.contents.push(product);
        this.updateSubtotal();
    }
// Remove item from cart by id
    removeItem(id) {
    for (let i = 0; i < this.contents.length; i++) {
        if (this.contents[i].id === id) {
            this.contents.splice(i, 1);
            console.log("removed");
            return;
        }
    }
    this.updateSubtotal();
    }
// Increment an item's amount by 1
    incrementItem(id) {
        for (let i = 0; i < this.contents.length; i++) {
            if (this.contents[i].id === id) {
                this.contents[i].amount++;
                this.updateSubtotal();
                return;
            }
        }
    }
// Decrement an item's amount by 1, when amount = 0, item is removed from cart
    decrementItem(id) {
        for (let i = 0; i < this.contents.length; i++) {
            if (this.contents[i].id === id) {
                if (this.contents[i].amount === 1) {
                    this.contents.splice(i, 1);
                    console.log("Removed after decrease");
                }
                else {
                    this.contents[i].amount--;
                    console.log("decreased");
                }
                return
            }
        }
        this.updateSubtotal();
    }
// Remove all items from cart
    clearCart() {
        this.contents = [];
        this.updateSubtotal();
    }
    // Retrieve amount of item by id
    getItemAmount(id) {
        let product = this.contents.find(item => item.id === id);
        if (product) {
            return product.amount;
        }
        return undefined;    
    }
    // Return item object from cart by id
    findItem(id) {
        return this.contents.find(item => item.id === id);
    }
    updateSubtotal() {
        let subtotal = 0;
        this.contents.forEach(item => subtotal += item.price * item.amount);
        this.subtotal = subtotal;
        console.log(this.subtotal);
    }
    updateTax() {
        this.tax = this.subtotal * this.taxRate;
    }
    updateTotal() {
        this.total = this.subtotal + this.tax;
    }
    updateNumberOfItems() {
        let itemCounter = 0;
        this.contents.forEach(item => itemCounter += item.amount);
        this.numberOfItems = itemCounter;
    }

    get subtotal() {
        return this.subtotal;
    }
    get tax() {
        return this.tax;
    }
    get total() {
        return this.total;
    }
    get contents() {
        return this.contents;
    }
    get numberOfItems() {
        return this.numberOfItems;
    }

    setContents(cartContents) {
        this.contents = cartContents;
        this.updateSubtotal();
        this.updateTax();
        this.updateTotal();
    }

    isEmpty() {
        if (this.numberOfItems > 0) {
            return false;
        }
        return true;
    }
    
}
class UI {
// Receives product object and creates card
    static createCard(product) {
        const productCard = document.createElement('div');
        productCard.classList.add("cardsContainer-item");
        productCard.setAttribute('data-id', product.id);
        productCard.setAttribute('data-title', product.title);
        productCard.setAttribute('data-category', product.category);
        productCard.innerHTML =
        `
            <div class="productCard">
                <div class="cardContents">
                    <div class="cardImgContainer">
                        <img src="${product.image}">
                    </div>
                    <div class="titleContainer">
                        <h2>${product.title}</h2>
                    </div>
                    <div class="slideUp">
                        <h4>${product.price}</h4>
                        <div class="btn" data-id="${product.id}"> Add to Cart</div>
                    </div>
                </div>
            </div>
        `;
        return productCard;
    }
// Receives array of product objects and appends their cards to productListings container
    static displayProducts(products) {
        products.forEach(item => {
            const card = UI.createCard(item);
            productListings.innerHTML += card;
        });

        //Add functionality for card buttons
        productListings.addEventListener('click', event => {
            let button = event.target;
            let itemId = parseInt(event.target.dataset.id);

            if (button.classList.contains('addToCartBtn')) {
                let inCart = cart.findItem(itemId);
                if (inCart == undefined) {
                    cart.addItem(itemId, 1);
                    UI.insertCartItem(itemId);
                }
                else {
                    cart.incrementItem(itemId);
                    UI.updateCartItemQty(itemId, inCart.amount);
                }
            UI.showCart();
            }
        });
    }

    static updateCartSubtotal(){
        cartSubtotal.innerText = `$${cart.subtotal.toFixed(2)}`;
    }
    static updateCartTax(){
        cartTax.innerText = `$${cart.tax.toFixed(2)}`;
    }
    static updateCartTotal(){
        cartTotal.innerText = `$${cart.total.toFixed(2)}`;
    }

    static updateCartNumberOfItems() {
        cartNumberOfItems.innerText = cart.numberOfItems;
    }

//----------CART---------------
// Displays cart
    static showCart() {
        cartOverlay.classList.add('show-cart-overlay');
        cartUI.classList.add('showCart');
    }
// Hides cart
    static hideCart() {
        cartOverlay.classList.remove('show-cart-overlay');
        cartUI.classList.remove('showCart');
    }
    static insertCartItemCard(product) {
        let cartItemCard = document.createElement('div');
        cartItemCard.classList.add('cart-item-container');
        cartItemCard.setAttribute('id', `cart-item-id-${product.id}`);
        cartItemCard.setAttribute('data-id', product.id);
    
        cartItemCard.innerHTML += 
        ` 
                <div class="cart-item-icons">
                    <div class="fas fa-times cart-remove-item"></div>
                </div>         
                <div class="cart-item"> 
                    <img src="${product.image}">
                    <div class="cart-item-info">
                        <h3>${product.title}</h3> 
                    </div>
                    <div class="cart-item-operations">
                        <i class="fas fa-minus"></i>
                        <h3 id="cart-item-id-${product.id}-amount" class="cart-item-amount">${product.amount}</h3>
                        <i class="fas fa-plus"></i>
                    </div>
                    <div class="cart-item-price">
                        <h4>$${product.price}</h4> 
                    </div>
                </div>
        `;

        cartItemCard.addEventListener('click', event => {
            let button = event.target;

            if (button.classList.contains('fa-plus')) {
                cart.incrementItem(product.id);
                let qty = cart.getItemAmount(product.id);
                UI.updateCartItemQty(product.id, qty);
            }
            else if (button.classList.contains('cart-remove-item')) { 
                cart.removeItem(product.id);
                UI.removeCartItem(product.id);
            }
            else if (button.classList.contains('fa-minus')) {
                cart.decrementItem(product.id);
                let qty = cart.getItemAmount(product.id);
                //if item still present in cart backend
                if (qty) {
                    UI.updateCartItemQty(product.id, qty);
                }
                //if not, delete it's cart UI card from DOM
                else {
                    UI.removeCartItem(product.id);
                }
            }
            Storage.saveCart(cart.contents);
            AppMGR.updateCartTotals();   
    });
    cartContents.appendChild(cartItemCard);
}
// Removes item from cart DOM by id
    static removeCartItem(id) {
    let toBeRemoved = document.getElementById(`cart-item-id-${id}`);
    cartContents.removeChild(toBeRemoved);
}
    // Searches cartDOM for cartItem and changes amount
    static updateCartItemQty(id, amount) {
       let itemQty = document.getElementById(`cart-item-id-${id}-amount`);
       itemQty.innerText = amount;
    }

    static updateCheckout(cart) {
        if (cart.isEmpty() == true) {
            console.log('making visible')
            cartEmptyMessage.classList.remove('invisible'); 
            cartCheckoutBtn.classList.add('invisible');
        }
        else {
            console.log('making invis')
            cartEmptyMessage.classList.add('invisible');
            cartCheckoutBtn.classList.remove('invisible');
        }
    }

    static openNavBar() {
        navBar.classList.add('responsive');
    }
    static closeNavBar() {
        navBar.classList.remove('responsive');
    }
    static filterProducts() {
        // Get all product cards from DOM
            let productCards = productListings.childNodes;

        // Get user search
            let input = searchBar.value.toUpperCase();

        // Get all checked categories
            let categoryCheckboxes = categoryContainer.querySelectorAll('.category-checkbox');
            let checkedBoxes = [...categoryCheckboxes].filter(checkbox => checkbox.checked);
            let checkedCategories = checkedBoxes.map(checkbox => checkbox.dataset.category);
            console.log(checkedCategories);
        
        // Get checkedmarked categories
            
        
        // Loop through all list items, and hide those who don't match the search query
        productCards.forEach(productCard => {

            let cardTitle = productCard.dataset.title.toUpperCase();
            let cardCategories = productCard.dataset.category.toUpperCase();

        // Test 1: Card name or category matches input
            if (cardTitle.indexOf(input) == -1 && cardCategories.indexOf(input) == -1) {
            // Hide card
                console.log("card does not match input");
                productCard.classList.add('invisible');
                return;
            }
        // Test 2: Card matches category checkboxes if 1 or more are checked
            else if (checkedCategories.length == 0) {
                console.log("no categories checked, showing all");
                productCard.classList.remove('invisible');
                return;
            }
            else {
                for (let i = 0; i < checkedCategories.length; i++) {
                    // If card matches any one checked category
                    if (cardCategories.indexOf(checkedCategories[i].toUpperCase()) > -1) {
                        productCard.classList.remove('invisible');
                        return;
                    }
                }
            }
            productCard.classList.add('invisible');
        });
    }

    static importCategories() {
        categories.forEach(category => {
            const categoryCheckboxContainer = document.createElement('div');
            categoryCheckboxContainer.classList.add('checkbox-container');

            const checkbox = document.createElement('input');
            checkbox.classList.add('category-checkbox');
            checkbox.setAttribute('data-category', category);
            checkbox.setAttribute('type', 'checkbox');
            checkbox.addEventListener('click', UI.filterProducts);

            const checkboxTitle = document.createElement('h3');
            checkboxTitle.innerText = category;

            categoryCheckboxContainer.appendChild(checkbox);
            categoryCheckboxContainer.appendChild(checkboxTitle);

            categoryContainer.appendChild(categoryCheckboxContainer);
        });
        
    }

}
// LocalStorage operations
class Storage {
    //Saves loaded products to local storage for attribute references
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    //Downloads array of products from Contentful client and stores in local storage
    static async loadProducts() {
        try {
            let contentful = await client.getEntries({content_type: "product"});
            let products = contentful.items;

            //destructuring contentful json format
            products = products.map(item => {
                const {category, title, price, id} = item.fields;
                const image = item.fields.image.fields.file.url;
                return {category, title, price, id, image};
            })
            localStorage.setItem("products", JSON.stringify(products));
            console.log(products)
            return products;
        } 
        catch (error) {
            console.log(error);
        }
    }
    // Saves cart for next session
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    // Retrieves cart from previous session
    static getCart() {
        if (localStorage.getItem('cart')) {
            return JSON.parse(localStorage.getItem('cart'));
        }
        else {
            return [];
        }
    }
    // Retrieves product info from local storage
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(item => item.id === id);
    }
}

class AppMGR {

    static setup() {
        cart.setContents(Storage.getCart());
        cart.contents.forEach(item => {UI.insertCartItemCard(item);});
        this.updateCartTotals();
        UI.importCategories();
    }

    // Add a product to the listing container
    static createListing(id) {
    // Load product info from storage
        let product = {...Storage.getProduct(id)};

    // Create product card
        let productCard = UI.createCard(product);

    // Add card button functionality
        productCard.addEventListener('click', event => {
            let button = event.target;
            let productId = parseInt(productCard.dataset.id);

            if (button.classList.contains('btn')) {
                this.addToCart(productId, 1);
            }
        });

        productListings.appendChild(productCard);
    }

    // Create listings for a group of products  
    static displayProducts(category) {
        category.forEach(item => AppMGR.createListing(item.id));
    }

    // Adds specied amount of product to the cart
    static addToCart(id, amount = 1) {
        let inCart = cart.findItem(id);
            if (inCart) {
                    cart.incrementItem(id);
                    UI.updateCartItemQty(id, inCart.amount);
                }
            else {
                let product = {...Storage.getProduct(id)};
                if (product != undefined) {
                    cart.addItem(product, 1);
                    UI.insertCartItemCard(product);
                }
            }
            Storage.saveCart(cart.contents);
            this.updateCartTotals();
            UI.showCart();
    }

    static updateCartTotals() {
        cart.updateSubtotal();
        cart.updateTax();
        cart.updateTotal();
        cart.updateNumberOfItems();

        UI.updateCartSubtotal();
        UI.updateCartTax();
        UI.updateCartTotal();
        UI.updateCartNumberOfItems();
        UI.updateCheckout(cart);
    }

    static clearCart() {
        while (cartContents.children.length > 0) {
            cartContents.removeChild(cartContents.children[0]);
        }
    }
}

let cart = new Cart;
let products;

openCartBtn.addEventListener('click', UI.showCart);
closeCartBtn.addEventListener('click', UI.hideCart);
cartOverlay.addEventListener('click', UI.hideCart);
mobileMenu.addEventListener('click', UI.openNavBar);
closeNavBar.addEventListener('click', UI.closeNavBar);

searchBar.addEventListener('input', UI.filterProducts);


document.addEventListener("DOMContentLoaded", function() {
    products = Storage.loadProducts().then(products => {
        AppMGR.setup();
        AppMGR.displayProducts(products);
    });

});



