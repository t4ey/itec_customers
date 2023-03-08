const express = require('express');
const authController = require('../controllers/auth.js');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('./admin/session/a_login');
});

// SIDE BAR GET REQUESTS

router.get('/home', (req, res) => {
    res.render('./admin/a_home');
});

router.get('/clients', (req, res) => {
    res.render('./admin/clientsNcustomers/clients');
});

router.get('/salesperson', (req, res) => {
    res.render('./admin/clientsNcustomers/salesperson');
});

router.get('/add_employee', (req, res) => {
    res.render('./admin/clientsNcustomers/add_employee.hbs');
});


module.exports = router;