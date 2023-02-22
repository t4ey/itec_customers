const express = require('express');
const authController = require('../controllers/auth.js');

const router = express.Router();

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

// POST ROUTES

router.post('/register', authController.register);

router.post('/login', authController.login);

module.exports = router;