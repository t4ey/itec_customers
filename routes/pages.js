const express = require('express');
const authController = require('../controllers/auth.js');

const router = express.Router();

// authentication jwt
const { requireAuth, checkUser, alreadyLogged } = require('../middleware/customers_middleware.js')

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

router.get('/marketplace', requireAuth, (req, res) => {

    res.render('./marketplace/market.hbs',);
});



// POST ROUTES

router.post('/register', alreadyLogged, authController.register);

router.post('/login', alreadyLogged, authController.login);

router.post('/profile', checkUser, authController.profile);

router.get('/logout', authController.logout);

module.exports = router;