const express = require('express');
const authController = require('../controllers/auth.js');

const router = express.Router();

router.get('/login', (req, res) => {
    res.send("hi admin");
    // res.render('./admin/session/login.hbs');
});

module.exports = router;