const mysql = require("mysql");

const express = require('express');
const user_tables = require('../routes/admin_tables/user_tables');
const router = express.Router();

// idk
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { db } = require('../database/database.js');

exports.login = async (req, res) => {
    console.log("login body:", req.body);

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.flash('message', "Nesecita un correo electronico y una contraseña para iniciar sesión");
            req.flash('alertType', "alert-warning");
            return res.redirect('/admin/login');
        }

        await db.query('SELECT * FROM administradores WHERE email = ?', [email.trim()], async (error, result) => {
            console.log("login result : " + result.length);
            if (!(result.length > 0)) {
                console.log(result);
                req.flash('message', "El usuario o la contraseña es incorrecto");
                req.flash('alertType', "alert-danger");
                return res.redirect('/admin/login');

            } else if (!(await bcrypt.compare(password, result[0].password))) {
                console.log(result);
                req.flash('message', "El usuario o la contraseña es incorrecto");
                req.flash('alertType', "alert-danger");
                return res.redirect('/admin/login');
            } else {
                console.log(result);
                const id = result[0].id;
                const jwt_secret = "secretAdminPassword";
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
                
                return res.redirect("/admin/home");
            }
        });

    } catch (error) {
        console.log(error);
    }
}

exports.logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });

    return res.redirect("/admin/login");
}

exports.add_employee = async (req, res) => {

    const { name, lastName, phoneNumber, email, localAddress, role, password, repPassword } = req.body;
    let isAdmin = (role == "admin")? true : false;
    console.log(req.body);


    await db.query("SELECT email FROM administradores WHERE email = ?", [email.trim()], async (error, result) => {
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

        db.query('INSERT INTO administradores SET ?', { first_name: name.trim(), last_name: lastName.trim(), email: email.trim(), phone_number: phoneNumber.trim(), address: localAddress.trim(), is_admin: isAdmin, password: hashedPassword }, (error, result) => {
            if (error)
                console.log(error);
            else{
                req.flash('message', "El usuario ha sido registrado correctamente, puede Iniciar Sesión.");
                req.flash('alertType', "alert-success");
                return res.redirect('/admin/salesperson');
            }

        });
    });

    // res.send("ok");
}

exports.edit_employee = async (req, res) => {
    const {id} = req.params;
    console.log(req.body);
    const { email, name, lastName, phone_number, local_address, reset_password} = req.body;


    if (!email || !name || !lastName || !phone_number || !local_address) {
        req.flash('message', "No puede dejar espacios vacios");
        req.flash('alertType', "alert-warning");
        return res.redirect(req.originalUrl);
    }

    await db.query("SELECT * FROM administradores WHERE id = ?", [id], async (error, result) => {
        // console.log("result : ", result);

        if (error)
            console.log(error);

        if (!result)
            res.redirect(req.originalUrl);    

        //change password only

        if (reset_password) {

            let hashedPassword = await bcrypt.hash(reset_password, 8);
            console.log(hashedPassword);

            await db.query('UPDATE administradores SET ? WHERE id = ' + id, { password: hashedPassword }, async (error, result) => {
                if (error)
                    console.log(error);

                else {
                    
                    req.flash("message", "La contraseña se actualizó correctamente");
                    req.flash('alertType', "alert-success");
                    // console.log(req.originalUrl);
                    return res.redirect(req.originalUrl);
                }

            });
        }
        //change data only

        else {
            await db.query('UPDATE administradores SET ? WHERE id = ' + id, { first_name: name.trim(), last_name: lastName.trim(), email: email.trim(), phone_number: phone_number.trim(), address: local_address.trim() }, async (error, result) => {
                if (error) {
                    console.log(error);
                }
                else {
                    req.flash("message", "Los cambios se aplicaron exitosamente");
                    req.flash('alertType', "alert-success");
                    // console.log(req.originalUrl);
                    return res.redirect(req.originalUrl);
                }

            });
        }

    });
}

exports.delete_employee = async (req, res) => {
    const { id } = req.params;

    await db.query('DELETE FROM administradores WHERE id = ?', [id]);

    req.flash('message', 'El usuario a sido eliminado exitosamente');
    req.flash('alertType', 'alert-success');
    res.redirect('/admin/salesperson');
}

// client section

exports.edit_client = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const { email, name, last_name, reset_password } = req.body;


    if (!email || !name || !last_name) {
        req.flash('message', "No puede dejar espacios vacios");
        req.flash('alertType', "alert-warning");
        return res.redirect(req.originalUrl);
    }

    await db.query("SELECT * FROM client WHERE id = ?", [id], async (error, result) => {
        // console.log("result : ", result);

        if (error)
            console.log(error);

        if (!result)
            res.redirect(req.originalUrl);

        //change password only

        if (reset_password) {

            let hashedPassword = await bcrypt.hash(reset_password, 8);
            console.log(hashedPassword);

            await db.query('UPDATE client SET ? WHERE id = ' + id, { password: hashedPassword }, async (error, result) => {
                if (error)
                    console.log(error);

                else {

                    req.flash("message", "La contraseña se actualizó correctamente");
                    req.flash('alertType', "alert-success");
                    // console.log(req.originalUrl);
                    return res.redirect(req.originalUrl);
                }

            });
        }
        //change data only

        else {
            await db.query('UPDATE client SET ? WHERE id = ' + id, { first_name: name.trim(), last_name: last_name.trim(), email: email.trim() }, async (error, result) => {
                if (error) {
                    console.log(error);
                }
                else {
                    req.flash("message", "Los cambios se aplicaron exitosamente");
                    req.flash('alertType', "alert-success");
                    // console.log(req.originalUrl);
                    return res.redirect(req.originalUrl);
                }

            });
        }

    });
}

exports.delete_client = async (req, res) => {
    const { id } = req.params;

    await db.query('DELETE FROM client WHERE id = ?', [id]);

    req.flash('message', 'El cliente a sido eliminado exitosamente');
    req.flash('alertType', 'alert-success');
    res.redirect('/admin/clients');
}