//MySQL connection
const mysql = require("mysql");

// idk
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { db } = require('../database/database.js');
const { checkUser } = require("../middleware/customers_middleware.js");
const { application } = require("express");

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
        
        db.query('INSERT INTO client SET ?', { first_name: name, last_name: lastName, email: email, password: hashedPassword}, (error, result) => {
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


exports.login = async (req, res) => {
    console.log(req.body);

    try{
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).render('./session/login.hbs', {
                message: "Nesecita un correo electronico y una contraseña para iniciar sesión",
                alertType: "alert-warning"
            })
        }

        await db.query('SELECT * FROM client WHERE email = ?', [email], async (error, result) => {
            console.log("test : " + result.length);
            if (!(result.length > 0)){
                console.log(result);
                return res.status(400).render('./session/login', {
                    message: "El usuario o la contraseña es incorrecto",
                    alertType: "alert-danger"
                });
            } else if (!(await bcrypt.compare(password, result[0].password))) {
                console.log(result);
                return res.status(400).render('./session/login', {
                    message: "El usuario o la contraseña es incorrecto",
                    alertType: "alert-danger"
                });
            } else {
                console.log(result);
                const id = result[0].id;
                const jwt_secret = "secretPassword";
                const jwt_expire_in = 3 * 24 * 60 * 60;

                // create JWT token

                const token = jwt.sign({ id: id }, jwt_secret, {
                    expiresIn: jwt_expire_in,
                });

                const cookieOptions = {
                    maxAge: jwt_expire_in * 1000,
                    httpOnly: true,
                }
                
                res.cookie('jwt', token, cookieOptions);

                return res.redirect("/");
            }
        });

    } catch (error) {
        console.log(error);
    }
}

exports.profile = async (req, res) => {
    
    console.log(req.body);

    const { name, lastName, email, password, newPassword, repNewPassword } = req.body;

    if (!email || !name || !lastName) {
        return res.status(400).render('./session/profile.hbs', {
            message: "No puede dejar espacios vacios",
            alertType: "alert-warning"
        })
    }

    if (newPassword || repNewPassword || password) {
        if(!newPassword || !repNewPassword){
            return res.status(400).render('./session/profile.hbs', {
                message: "No puede dejar espacios vacios",
                alertType: "alert-warning"
            })
        }
        else if (!(newPassword == repNewPassword)){
            return res.status(400).render('./session/profile.hbs', {
                message: "Las contraseñas no coinciden",
                alertType: "alert-warning"
            })
        }
    } 
    
    await db.query("SELECT email FROM client WHERE email = ?", [email], async (error, result) => {
        if (error)
            console.log(error);

        if (password){

            if (!(await bcrypt.compare(password, result[0].password))) {
                console.log(result);
                return res.status(400).render('./session/profile', {
                    message: "La contraseña no es valida",
                    alertType: "alert-danger"
                });
            }
            else {

                let hashedPassword = await bcrypt.hash(password, 8);

                db.query('UPDATE client SET ?', { first_name: name, last_name: lastName, email: email, password: hashedPassword }, (error, result) => {
                    if (error)
                        console.log(error);
                    else
                        return res.render('./session/profile.hbs', {
                            message: "Los cambios se aplicaron correctamente exitosamente",
                            alertType: "alert-success",
                        });
        
                });            
            }
        }
        else {
            await db.query('UPDATE client SET ?', { first_name: name, last_name: lastName, email: email}, async (error, result) => {
                if (error) {
                    console.log(error);
                }
                else {
                    await res.status(200).redirect('/profile');
                    console.log(__dirname);
                    return await res.render('../views/session/profile_customers.hbs',  
                    {
                        message: "Los cambios se aplicaron correctamente exitosamente",
                        alertType: "alert-success",
                    }
                    );
                }

            });   
        }

    });
}

exports.logout = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});

    return res.redirect("/");
}