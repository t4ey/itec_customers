const mysql = require("mysql");

// idk
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { db } = require('../../database/database.js');

exports.admins = async (req, res) => {

    const { name, lastName, phoneNumber, email, localAddress, role, password, repPassword } = req.body;
    let isAdmin = (role == "admin") ? true : false;

    await db.query("SELECT * FROM administradores", async (error, result) => {
        if (error)
            console.log(error);

        employees = result;
        if (result) {
            // console.log(result);
            return res.render('./admin/clientsNcustomers/salesperson', {
                employees: employees
            });
        }
        else 
            console.log("nop");
            
    });
        
}