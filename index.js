const express = require('express'); 
const app = express();
const port = 3000;

const path = require('path');

//MySQL connection
const mysql = require("mysql");

const db = mysql.createConnection({
    host: '192.168.76.200',
    user: 'itec',
    password: 'alva234',
    database: 'ova_store'
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

app.set('view engine', 'hbs');

// ROUTES USED

app.use('/', require('./routes/pages.js'));

app.listen(port, () => {
    console.log("server started at port: "  + port);
});