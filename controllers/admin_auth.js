const mysql = require("mysql");

// idk
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { db } = require('../database/database.js');

exports.add_employee = async (req, res) => {

    const { name, lastName, phoneNumber, email, localAddress, role, password, repPassword } = req.body;
    let isAdmin = (role == "admin")? true : false;
    console.log(req.body);


    await db.query("SELECT email FROM administradores WHERE email = ?", [email], async (error, result) => {
        if (error)
            console.log(error);

        if (result.length > 0)
            return res.render('./admin/clientsNcustomers/add_employee', {
                message: "Ese correo ya esta en uso",
                alertType: "alert-danger",
            });
        else if (password != repPassword)
            return res.render('./admin/clientsNcustomers/add_employee', {
                message: "Las contraseñas no son las mismas",
                alertType: "alert-danger",
            });

        let hashedPassword = await bcrypt.hash(password, 8);
        // console.log(typeof(hashedPassword));
        // console.log(hashedPassword.length);

        db.query('INSERT INTO administradores SET ?', { first_name: name, last_name: lastName, email: email, phone_number: phoneNumber, address: localAddress, is_admin: isAdmin, password: hashedPassword }, (error, result) => {
            if (error)
                console.log(error);
            else
                return res.render('./admin/clientsNcustomers/salesperson', {
                    message: "El usuario ha sido registrado correctamente, puede Iniciar Sesión",
                    alertType: "alert-success",
                });

        });
    });

    // res.send("ok");
}