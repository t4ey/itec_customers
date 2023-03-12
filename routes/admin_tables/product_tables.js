exports.products = async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    // console.log(message);
    res.render('./admin/products/products.hbs')
    // await db.query("SELECT * FROM client", async (error, result) => {
    //     if (error)
    //         console.log(error);

    //     clients = result;
    //     if (result) {
    //         // console.log(result);
    //         return res.render('./admin/clientsNcustomers/clients', {
    //             clients: clients,
    //             message: message,
    //             alertType: alertType,
    //         });
    //     }
    //     else
    //         console.log("nop");

    // });

}

exports.add_product = async (req, res) => {

    const { name, lastName, phoneNumber, email, localAddress, role, password, repPassword } = req.body;
    let isAdmin = (role == "admin") ? true : false;
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
            else {
                req.flash('message', "El usuario ha sido registrado correctamente, puede Iniciar Sesión.");
                req.flash('alertType', "alert-success");
                return res.redirect('/admin/salesperson');
            }

        });
    });

    // res.send("ok");
}