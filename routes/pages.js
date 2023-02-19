const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index.hbs')
});

router.get('/login', (req, res) => {
    res.render('./session/login.hbs')
});

router.get('/register', (req, res) => {
    res.render('./session/register.hbs')
});

module.exports = router;