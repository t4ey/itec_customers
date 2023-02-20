//MySQL connection
const mysql = require("mysql");

const db = mysql.createConnection({
    host: '192.168.76.200',
    user: 'itec',
    password: 'alva234',
    database: 'ova_store'
});

exports.register = async (req, res) => {

    console.log(req.body);
    const {name, lastName, email, password, repPassword} = req.body;

    await db.query("SELECT email FROM client WHERE email = ?", [email], (error, result) => {
        if(error)
            console.log(error);
        
        if(result.length > 0)
            return res.render('./session/register.hbs', {
                message: "Ese correo ya esta en uso",
            });
        else if(password != repPassword)
            return res.render('./session/register.hbs', {
                message: "Las contraseñas no son las mismas",
            });
    });

    res.send("ok");
}