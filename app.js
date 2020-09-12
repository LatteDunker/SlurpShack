
// Contentful CMS
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "m2z72uvohsnc",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "2N1L8FuQIEqU2Y3VOwPJ6mc3oYwVOxs6wR7wWStnJk0"
  });
console.log(client);

///////////////////////////////////////////////////////////////////////////////////////////
class Cart {
    contents = [];

    // Add item to cart
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

}

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



///////////////////////////////////////////////////////////////////////////////////////////

Storage.loadProducts();

let cart = new Cart;
