const express = require('express');
const adminAuthController = require('../controllers/admin_auth.js');
const user_tables = require('../routes/admin_tables/user_tables');
const product_tables = require('../routes/admin_tables/product_tables.js');

const router = express.Router();

// upload images

const multer = require('multer');
const { memoryStorage } = require('multer');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './');
//     },
//     filename: (req, file, cb) => {
//         const f_extension = file.originalname.split('.').pop();
//         cb(null, 'uploaded-' + Date.now + f_extension);
//     }
// });

const storage = memoryStorage();

const upload_image = multer({ storage: storage });

// AUTHENTICATION REQUESTS

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

router.get('/edit_product/:id', async (req, res) => {
    const { id } = req.params;
    const message = req.flash('message');
    const alertType = req.flash('alertType');
    const p_categories = await db.query('SELECT * FROM categoria');
    const product = await db.query('SELECT * FROM producto WHERE id = ?', [id]);
    const prod_cat_ids = await db.query('SELECT cat_id FROM clasificacion WHERE prod_id = ?', [id]);

    // console.log(p_categories[3].id);
    for(var i = 0; i < prod_cat_ids.length; i++) {
        // console.log("next : ", i)
        for(var j = 0; j < p_categories.length; j++){
            if(p_categories[j].id == prod_cat_ids[i].cat_id) {
                p_categories[j].checked = true;
                // console.log(p_categories[i].id, "ch");
            }
        }
    }
    // console.log(p_categories);
    // console.log(p_categories);

    res.render('./admin/products/edit_product.hbs', {
        product: product[0],
        product_categories: p_categories,

        message: message,
        alertType: alertType
    });
});

    // categories pages

router.get('/categories', product_tables.categories);

router.get('/add_category', (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');
    // console.log(p_categories);

    res.render('./admin/products/add_category', {
        message: message,
        alertType: alertType
    });
});

router.get('/edit_category/:id', async (req, res) => {
    const { id } = req.params;
    const message = req.flash('message');
    const alertType = req.flash('alertType');
    const category = await db.query('SELECT * FROM categoria WHERE id = ?', [id]);
    // console.log(category[0]);

    res.render('./admin/products/edit_category', {
        category: category[0],
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

router.post('/add_product', upload_image.single('image'), product_tables.add_product);

router.post('/edit_product/:id', upload_image.single('image'), product_tables.edit_product);

router.get('/delete_product/:id', product_tables.delete_product);

router.post('/add_category', product_tables.add_category);

router.post('/edit_category/:id', product_tables.edit_category);

router.get('/delete_category/:id', product_tables.delete_category);

module.exports = router;