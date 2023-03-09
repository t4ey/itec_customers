const express = require('express');
const adminAuthController = require('../controllers/admin_auth.js');
const user_tables = require('../routes/admin_tables/user_tables');

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

// sales person pages

router.get('/salesperson', user_tables.admins);

router.get('/add_employee', (req, res) => {
    res.render('./admin/clientsNcustomers/add_employee.hbs');
});

router.get('/edit_employee/:id', async (req, res) => {
    const { id } = req.params;

    let employee = await db.query('SELECT * FROM administradores WHERE id = ?', [id]);
    res.render('./admin/clientsNcustomers/edit_employee.hbs' ,{
        employee: employee[0],
    });
});

// POST REQUESTS

router.post('/add_employee', adminAuthController.add_employee);


module.exports = router;