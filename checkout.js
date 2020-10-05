const cartContents = document.getElementById('cart-contents');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTax = document.getElementById('cart-tax');
const cartTotal = document.getElementById('cart-total');

let cart = getCart();



cart.forEach(product => {
    let cartItemCard = document.createElement('div');
    cartItemCard.classList.add('cart-item-container');
    cartItemCard.setAttribute('id', `cart-item-id-${product.id}`);
    cartItemCard.setAttribute('data-id', product.id);

    cartItemCard.innerHTML += 
    `         
            <div class="cart-item"> 
                <img src="${product.image}">
                <div class="cart-item-info">
                    <h3>${product.title}</h3> 
            </div>
            <div class="cart-item-operations">
                <h3 id="cart-item-id-${product.id}-amount" class="cart-item-amount">${product.amount}</h3>
            </div>
            <div class="cart-item-price">
                <h4>$${product.price}</h4> 
            </div>
    `;
    cartContents.appendChild(cartItemCard);
});

cartSubtotal.innerText = calcSubtotal(cart);
cartTax.innerText = calcTax(cart);
cartTotal.innerText = calcTotal(cart);



// for each item in cart
    // create a card
    // append to cart-contents
    // update UI cart values

function getCart() {
    if (localStorage.getItem('cart')) {
        return JSON.parse(localStorage.getItem('cart'));
    }
    else {
        return [];
    }
}

function calcSubtotal(cart) {
    let subtotal = 0;
    cart.forEach(product => {
        subtotal += product.price * product.amount;
    });
    return subtotal.toFixed(2);
 }
function calcTax(cart) {
    let tax = 0;
    cart.forEach(product => {
        tax += product.price * product.amount * 0.0725;
    });
    return tax.toFixed(2);
}
function calcTotal(cart) {
    let total = 0;
    cart.forEach(product => {
        total += product.price * product.amount * 1.0725;
    });
    return total.toFixed(2);
}