const mysql = require("mysql");

const express = require('express');
const user_tables = require('../routes/admin_tables/user_tables');
const router = express.Router();

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

exports.edit_employee = async (req, res) => {
    const {id} = req.params;

    const { name, lastName, email, password, newPassword, repNewPassword } = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);

    if (!email || !name || !lastName) {
        return res.status(400).render('./session/profile_customers.hbs', {
            message: "No puede dejar espacios vacios",
            alertType: "alert-warning"
        })
    }

    if (newPassword || repNewPassword || password) {
        if (!newPassword || !repNewPassword || !password) {
            return res.status(400).render('./session/profile_customers.hbs', {
                message: "No puede dejar espacios vacios",
                alertType: "alert-danger"
            })
        }
        else if (!(newPassword == repNewPassword)) {
            return res.status(400).render('./session/profile_customers.hbs', {
                message: "Las contraseñas no coinciden",
                alertType: "alert-danger"
            })
        }
    }

    await db.query("SELECT * FROM client WHERE email = ?", [email], async (error, result) => {
        userId = res.locals.user.id;
        // console.log("result : ", result);

        if (error)
            console.log(error);

        //change password

        if (password) {

            if (!(await bcrypt.compare(password, result[0].password))) {
                console.log(result);
                return res.status(400).render('/session/profile', {
                    message: "La contraseña no es valida",
                    alertType: "alert-danger"
                });
            }
            else {

                let hashedPassword = await bcrypt.hash(newPassword, 8);
                console.log(hashedPassword);

                await db.query('UPDATE client SET ? WHERE id = ' + userId, { password: hashedPassword }, async (error, result) => {
                    if (error)
                        console.log(error);
                    else {

                        getUpdatedUser = await db.query('SELECT * FROM client WHERE id = ?', [userId]);
                        user = getUpdatedUser[0];

                        res.render('./session/profile_customers.hbs',
                            {
                                user: user,
                                message: "Los cambios se aplicaron correctamente exitosamente",
                                alertType: "alert-success",
                            }
                        );
                    }

                });
            }
        }
        //change data only

        else {
            await db.query('UPDATE client SET ? WHERE  id = ' + userId, { first_name: name, last_name: lastName, email: email }, async (error, result) => {
                if (error) {
                    console.log(error);
                }
                else {
                    getUpdatedUser = await db.query('SELECT * FROM client WHERE id = ?', [userId]);
                    user = getUpdatedUser[0];
                    // console.log("result", user)
                    res.render('./session/profile_customers.hbs',
                        {
                            user: user,
                            message: "Los cambios se aplicaron correctamente exitosamente",
                            alertType: "alert-success",
                        }
                    );
                }

            });
        }

    });
}

exports.delete_employee = async (req, res) => {
    const { id } = req.params;

    // await db.query('DELETE FROM administradores WHERE id = ?', [id]);

    req.flash('message', 'El usuario a sido eliminado exitosamente');
    req.flash('alertType', 'alert-success');
    res.redirect('/admin/salesperson');
}