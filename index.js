const express = require('express'); 
const app = express();
const port = 3000;

const path = require('path');

// session COOKIES 
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//MySQL connection
const mysql = require("mysql");

const db = mysql.createConnection({
    host: '192.168.76.200',
    user: 'itec',
    password: 'alva234',
    database: 'e_store_ova'
});

db.connect(
    (error) => {
        if(error)
            console.log(error);
        else console.log("MySQL conection success.....");
    }
)

// HBS home page with handle bars

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// Parse URL encoded bodies (sent by html form)
app.use(express.urlencoded({ extended: false }));
// parse json bodies
app.use(express.json()),

app.set('view engine', 'hbs');

// ROUTES USED

app.use('/', require('./routes/pages.js'));

app.listen(port, () => {
    console.log("server started at port: "  + port);
});