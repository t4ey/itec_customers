const express = require('express'); 
const app = express();
const port = 3000;

const path = require('path');

// session COOKIES 
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// database start connection

// const {db} = require('./database/database.js');
const { checkUser } = require('./middleware/customers_middleware.js');

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

app.listen(port, () => {
    console.log("server started at port: "  + port);
});