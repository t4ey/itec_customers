const express = require('express');
const authController = require('../controllers/auth.js');
const { db } = require('../database/database.js');

const router = express.Router();

// authentication jwt
const { requireAuth, checkUser, alreadyLogged } = require('../middleware/customers_middleware.js');
// const { products } = require('./admin_tables/product_tables.js');
const marketplace = require('./marketplace/marketplace_pages.js');

// GET ROUTES

router.get('/', (req, res) => {

    // console.log(loggedIn);
    res.render('index.hbs');
});

router.get('/login', alreadyLogged, (req, res) => {
    res.render('./session/login.hbs')
});

router.get('/register', alreadyLogged, (req, res) => {
    res.render('./session/register.hbs')
});

router.get('/profile', requireAuth, (req, res) => {
    res.render('./session/profile_customers.hbs');
});

///marketplace section

router.get('/marketplace', requireAuth, async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    let categories = await db.query("SELECT * FROM categoria");

    const products = await db.query("SELECT * FROM producto");
    
    // console.log(products);
    // console.log(categories);
    res.render('./marketplace/market.hbs',{
        categories: categories,
        products: products,
        message: message,
        alertType: alertType,
    });
});

router.get('/marketplace/product/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    // console.log('id : ', id)
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    let product = await db.query("SELECT * FROM producto WHERE id = ?", [id]);
    let categories = await db.query("SELECT * FROM categoria");

    // console.log(product);
    // console.log(categories);
    res.render('./marketplace/product.hbs', {
        categories: categories,
        product: product[0],
        message: message,
        alertType: alertType,
    });
});


router.get('/marketplace/cart_shopping', requireAuth, async (req, res) => {
    const client_id = res.locals.user.id;
    // console.log('id : ', user_id)
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    let cart_products = await db.query("SELECT * FROM cart_shopping WHERE client_id = ?", [client_id]);
    // console.log(cart_products);
    let product;
    let products = [];
    let total_cash = 0;
    let n_products = 0;

    for( var i = 0; i < cart_products.length; i++){
        product = await db.query("SELECT * FROM producto WHERE id = ?", [cart_products[i].producto_id]);
        products.push(product[0]);
        products[i].quantity = cart_products[i].cantidad;
        total_cash += product[0].price * cart_products[i].cantidad;
        n_products++;
    }

    let pedido = false;
    const client_orders = await db.query("SELECT * FROM pedido WHERE client_id = ?", [client_id]);
    console.log(client_orders[client_orders.length - 1].status);
    if (!(client_orders[client_orders.length - 1].status == 'canceled') && !(client_orders[client_orders.length - 1].status == 'completed'))
        pedido = true;
    else { pedido = false }
    // console.log(products);
    // console.log(cart_products);
    // console.log(categories);
    res.render('./marketplace/cart_shopping.hbs', {
        order: pedido,
        total_cash: total_cash,
        n_products: n_products,
        products: products,
        message: message,
        alertType: alertType,
    });
});

router.get('/marketplace/search/', async (req, res) => {
    const search_string = req.query.search;
    const category = req.query.category;

    const message = req.flash('message');
    const alertType = req.flash('alertType');
    // console.log("name : ", search_string);
    let categories = await db.query("SELECT * FROM categoria");
    
    if(category) {
        const p_cat = await db.query("SELECT prod_id FROM clasificacion WHERE cat_id = ?", [category]);
        let p_cat_list = [];
        let products;
        for(var i = 0; i<p_cat.length;i++){
            p_cat_list.push(p_cat[i].prod_id);
        }
        if(p_cat.length > 0){
            products = await db.query("SELECT * FROM producto WHERE id IN (?);", [p_cat_list]);
        }
        console.log("pcat : " ,p_cat);
        console.log(products);

        return res.render('./marketplace/market.hbs', {
            categories: categories,
            products: products,
            message: message,
            alertType: alertType,
        });
    }
    
    else if (search_string && products.length > 0) {
        const products = await db.query("SELECT * FROM producto WHERE name LIKE '%"+search_string+"%'");
        // console.log(products);
        return res.render('./marketplace/market.hbs', {
            categories: categories,
            products: products,
            message: message,
            alertType: alertType,
        });
    } else {
        req.flash('message', 'no se encontro ningún producto');
        req.flash('alertType', 'alert-danger');
        res.redirect('/marketplace');
        // res.locals.products = null;
        // console.log("user checked", req.originalUrl);
        // console.log(await db.query("SELECT * FROM client WHERE id = 4"));
    }
    
});

// POST ROUTES

router.post('/register', alreadyLogged, authController.register);

router.post('/login', alreadyLogged, authController.login);

router.post('/profile', checkUser, authController.profile);

router.get('/logout', authController.logout);

    // marketplace posts

router.post('/marketplace/cart_shopping/add_product/:id', checkUser, marketplace.add_to_shopping_cart);

router.get('/marketplace/product/cart_shopping/remove_product/:id', requireAuth, marketplace.delete_cart_product);

router.post('/marketplace/cart_shopping/make_order', checkUser, marketplace.make_order);

router.post('/marketplace/cart_shopping/cancel_order', checkUser, marketplace.cancel_order);

module.exports = router;