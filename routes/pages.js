const express = require('express');
const authController = require('../controllers/auth.js');

const router = express.Router();

// authentication jwt
const { requireAuth } = require('../middleware/customers_middleware.js')

// GET ROUTES

router.get('/', (req, res) => {
    res.render('index.hbs')
});

router.get('/login', (req, res) => {
    res.render('./session/login.hbs')
});

router.get('/register', (req, res) => {
    res.render('./session/register.hbs')
});


///marketplace section

router.get('/marketplace', requireAuth, (req, res) => {
    res.render('./marketplace/market.hbs')
});

// POST ROUTES

router.post('/register', authController.register);

router.post('/login', authController.login);

module.exports = router;