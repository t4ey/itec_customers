const express = require('express'); 
const app = express();
const port = 3000;

const path = require('path');

// dlisplay confirmation messages tool
const flash = require('connect-flash');
const session = require('express-session');

// user and admins middlewares

const { checkUser } = require('./middleware/customers_middleware.js');
const { checkAdmin } = require('./middleware/admins_middleware.js');

const cookieParser = require('cookie-parser');

// session COOKIES 
app.use(cookieParser());

app.use(session({ secret: "SecretStringForSession", cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }));
app.use(flash());
// database start connection

const {db} = require('./database/database.js');

// db.connect(
//     (error) => {
//         if(error)
//             console.log(error);
//         else console.log("MySQL conection success.....");
//     }
// )

// HBS home page with handle bars

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// Parse URL encoded bodies (sent by html form)
app.use(express.urlencoded({ extended: false }));
// parse json bodies
app.use(express.json()),

app.set('view engine', 'hbs');

// ROUTES USED

// check all the get requests

app.get('*', checkUser);

app.use('/', require('./routes/pages.js'));

// check the admin pages if loged there are a locals.admin with the current admin data

app.get('/admin/*', checkAdmin);

app.use('/admin', require('./routes/admin_pages.js'));

app.listen(port, () => {
    console.log("server started at port: "  + port);
});
