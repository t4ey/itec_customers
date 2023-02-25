//MySQL connection
const mysql = require("mysql");

const db = mysql.createConnection({
    host: '192.168.76.200',
    user: 'itec',
    password: 'alva234',
    database: 'e_store_ova'
});

module.exports = {db};