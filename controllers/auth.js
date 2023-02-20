//MySQL connection
const mysql = require("mysql");

// idk
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
    host: '192.168.76.200',
    user: 'itec',
    password: 'alva234',
    database: 'e_store_ova'
});

exports.register = async (req, res) => {

    console.log(req.body);
    const {name, lastName, email, password, repPassword} = req.body;

    await db.query("SELECT email FROM client WHERE email = ?", [email], async (error, result) => {
        if(error)
            console.log(error);
        
        if(result.length > 0)
            return res.render('./session/register.hbs', {
                message: "Ese correo ya esta en uso",
                alertType: "alert-danger",
            });
        else if(password != repPassword)
            return res.render('./session/register.hbs', {
                message: "Las contraseñas no son las mismas",
                alertType: "alert-danger",
            });

        let hashedPassword = await bcrypt.hash(password, 8);
        // console.log(typeof(hashedPassword));
        // console.log(hashedPassword.length);
        
        await db.query('INSERT INTO client SET ?', { first_name: name, last_name: lastName, email: email, password: hashedPassword}, (error, result) => {
            if(error)
                console.log(error);
            else
                return res.render('./session/login.hbs', {
                    message: "Has sido registrado exitosamente",
                    alertType: "alert-success",
                });
                
        });
    });

    // res.send("ok");
}