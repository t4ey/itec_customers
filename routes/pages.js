const express = require('express');
const authController = require('../controllers/auth.js');

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
    let products = await db.query("SELECT * FROM producto");
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
    // const  user_id = res.locals.user.id;
    // console.log('id : ', user_id)
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    // let product = await db.query("SELECT * FROM  WHERE id = ?", [id]);
    // let categories = await db.query("SELECT * FROM categoria");

    // console.log(product);
    // console.log(categories);
    res.render('./marketplace/cart_shopping.hbs', {
        // categories: categories,
        // product: product[0],
        message: message,
        alertType: alertType,
    });
});


// POST ROUTES

router.post('/register', alreadyLogged, authController.register);

router.post('/login', alreadyLogged, authController.login);

router.post('/profile', checkUser, authController.profile);

router.get('/logout', authController.logout);

    // marketplace posts

router.post('/marketplace/cart_shopping/add_product/:id', checkUser, marketplace.add_to_shopping_cart);

module.exports = router;