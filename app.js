
// Contentful CMS
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "m2z72uvohsnc",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "2N1L8FuQIEqU2Y3VOwPJ6mc3oYwVOxs6wR7wWStnJk0"
  });
console.log(client);

const productListings = document.getElementById('productListings');
const showCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');

const cartOverlay = document.querySelector('.cart-overlay');
const cartUI = document.querySelector('.cart');
const cartContents = document.getElementById('cart-contents');

///////////////////////////////////////////////////////////////////////////////////////////
// Backend Cart
class Cart {
    contents = [];
    subtotal = 0;
    total = 0;

    // Add item to cart + + + + + + + + + REMOVE STORAGE FUNCTIONALITY FROM THIS AND UI.insertCartItem
    addItem(id, amount) {
      let inCart = this.contents.find(item => item.id === id);
  
      //if product present in cart contents
      if (inCart !== undefined) {
        //increment by amount
        inCart.amount += amount;
        console.log("Item found");
      }
      //otherwise add new product to cart
      else {  
        let cartItem = {...Storage.getProduct(id)};
        cartItem.amount = amount;
        this.contents.push(cartItem);
      }
    }

    incrementItem(id) {
        for (let i = 0; i < this.contents.length; i++) {
            if (this.contents[i].id === id) {
                this.contents[i].amount++;
                console.log("Increased");
                return;
            }
        }
    }

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
    }
    clearCart() {
        this.contents = [];
    }
    getItemAmount(id) {
        let product = this.contents.find(item => item.id === id);
        if (product) {
            return product.amount;
        }
        return undefined;    
    }
    findItem(id) {
        return this.contents.find(item => item.id === id);
    }

    updateSubtotal() {}
    updateTotal() {}
    


}

// LocalStorage operations
class Storage {
    //Saves loaded products to local storage for attribute references
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    //Downloads series of products from Contentful client and stores in local storage
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

// + + + + replace direct access to cart.contents.items with item class and accessors

class UI {
//Creates product card (Button functionality is added in this method via onclick)
    static createCard(product) {
        let productCard = 
        `
         <div class="cardsContainer-item">
            <div class="productCard" data-id="${product.id}">
                <div class="cardContents">
                    <div class="cardImgContainer">
                        <img src="${product.image}">
                    </div>
                    <div class="titleContainer">
                        <h2>${product.title}</h2>
                    </div>
                    <div class="slideUp">
                        <h4>${product.price}</h4>
                        <div class="addToCartBtn" data-id="${product.id}"> Add to Cart</div>
                    </div>
                </div>
            </div>
        </div>
        `;
        return productCard;
    }
// Appends product cards to "productListings" container
    static displayProducts(products) {
        products.forEach(item => {
            const card = UI.createCard(item);
            productListings.innerHTML += card;
        })
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
                    inCart.amount++;
                    UI.updateItemQty(itemId, inCart.amount);
                }
                UI.showCart();
            }
        });
    }
// Displays cart
    static showCart() {
        cartOverlay.classList.add('show-cart-overlay');
        cartUI.classList.add('showCart');
        console.log('open')
    }
// Hides cart
    static hideCart() {
        cartOverlay.classList.remove('show-cart-overlay');
        cartUI.classList.remove('showCart');
    }
// Updates quantity item in cart DOM
    static updateItemQty(id, amount) {
       let itemQty = document.getElementById(`cart-item-id-${id}`).children[2].children[1];
       itemQty.innerText = amount;
    }
// Appends a new item to cart DOM
    static insertCartItem(id) {
        let product = cart.findItem(id);

        //create a div containing item info + amount
        let cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.setAttribute('id', `cart-item-id-${id}`);
  
        cartItem.innerHTML += 
        `
            <img src=${product.image}>
                <div class="item-info">
                    <h3>${product.title}</h3> 
                    <h4>${product.price}</h4>
                </div>
                <div>
                    <i class="fas fa-chevron-up"></i>
                    <p class="cart-item-amount">${product.amount}</p>
                    <i class="fas fa-chevron-down"></i>
                </div>
        `;

        // EVENT LISTENERS 
        cartItem.addEventListener('click', event => {
            let button = event.target;

            if (button.classList.contains('fa-chevron-up')) {
                //increment backend
                cart.incrementItem(id);
                //increment frontend
                button.nextElementSibling.innerText = cart.getItemAmount(id);
                //refresh cart values
                
            }
            else if (button.classList.contains('removeItem')) { 
                cart.removeItem(id);
                //remove frontend entire cartItem
                UI.removeFromCart(id);
                //refresh cart values
            }
            else if (button.classList.contains('fa-chevron-down')) {
                cart.decrementItem(id);
                let qty = cart.getItemAmount(id);
                //if item still present in cart backend
                if (qty !== undefined) {
                    button.previousElementSibling.innerText = qty; 
                }
                //if not, delete it's cart UI card from DOM
                else {
                    UI.removeFromCart(id);
                }
            }
        });
        // Append div to cartContents
        cartContents.appendChild(cartItem);

    }
// Removes item from cart DOM by id
    static removeFromCart(id) {
        let toBeRemoved = document.getElementById(`cart-item-id-${id}`);
        cartContents.removeChild(toBeRemoved);
    }
}



///////////////////////////////////////////////////////////////////////////////////////////

let cart = new Cart;
let products;
showCartBtn.addEventListener('click', UI.showCart);
closeCartBtn.addEventListener('click', UI.hideCart);
cartOverlay.addEventListener('click', UI.hideCart);


products = Storage.loadProducts().then(products => {
    UI.displayProducts(products);
});

cart.addItem(3, 2);




