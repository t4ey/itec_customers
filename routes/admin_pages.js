const express = require('express');
const authController = require('../controllers/auth.js');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('./admin/session/a_login');
});

router.get('/home', (req, res) => {
    res.render('./admin/a_home');
});

module.exports = router;