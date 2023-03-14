const express = require('express');
const adminAuthController = require('../controllers/admin_auth.js');
const user_tables = require('../routes/admin_tables/user_tables');
const product_tables = require('../routes/admin_tables/product_tables.js');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('./admin/session/a_login');
});

// SIDE BAR GET REQUESTS

router.get('/home', (req, res) => {
    res.render('./admin/a_home');
});

    // client pages

router.get('/clients', user_tables.clients);

router.get('/edit_client/:id', async (req, res) => {
    const { id } = req.params;
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    let client = await db.query('SELECT * FROM client WHERE id = ?', [id]);
    res.render('./admin/clientsNcustomers/edit_client.hbs', {
        client: client[0],
        message: message,
        alertType: alertType
    });
});

    // sales person pages

router.get('/salesperson', user_tables.admins);

router.get('/add_employee', (req, res) => {
    res.render('./admin/clientsNcustomers/add_employee.hbs');
});

router.get('/edit_employee/:id', async (req, res) => {
    const { id } = req.params;
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    let employee = await db.query('SELECT * FROM administradores WHERE id = ?', [id]);
    res.render('./admin/clientsNcustomers/edit_employee.hbs' ,{
        employee: employee[0],
        message: message,
        alertType: alertType
    });
});

    // products page

router.get('/products', product_tables.products);

router.get('/add_product', async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');
    const p_categories = await db.query('SELECT * FROM categoria');
    // console.log(p_categories);

    res.render('./admin/products/add_product.hbs', {
        product_categories: p_categories,
        message: message,
        alertType: alertType
    });
});

// POST REQUESTS

router.post('/add_employee', adminAuthController.add_employee);

router.get('/delete_employee/:id', adminAuthController.delete_employee);

router.post('/edit_employee/:id', adminAuthController.edit_employee);

// router.post('/add_employee', adminAuthController.add_employee);

router.get('/delete_client/:id', adminAuthController.delete_client);

router.post('/edit_client/:id', adminAuthController.edit_client);

    // products pages

router.post('/add_product', product_tables.add_product);

module.exports = router;