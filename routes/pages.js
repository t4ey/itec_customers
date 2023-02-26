const express = require('express');
const authController = require('../controllers/auth.js');

const router = express.Router();

// authentication jwt
const { requireAuth, checkUser, alreadyLogged } = require('../middleware/customers_middleware.js')

// GET ROUTES

router.get('/', (req, res) => {
    if(res.locals.user){
        loggedIn = true;
    }else loggedIn = false;
    // console.log(loggedIn);
    res.render('index.hbs', {
        loggedIn: loggedIn,
    });
});

router.get('/login', alreadyLogged, (req, res) => {
    res.render('./session/login.hbs')
});

router.get('/register', alreadyLogged, (req, res) => {
    res.render('./session/register.hbs')
});

///marketplace section

router.get('/marketplace', requireAuth, (req, res) => {
    if (res.locals.user) {
        loggedIn = true;
    } else loggedIn = false;

    res.render('./marketplace/market.hbs', {
        loggedIn: loggedIn,
    });
});


// POST ROUTES

router.post('/register', alreadyLogged, authController.register);

router.post('/login', alreadyLogged, authController.login);

router.get('/logout', authController.logout);

module.exports = router;