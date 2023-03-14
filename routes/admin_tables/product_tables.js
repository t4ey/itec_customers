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

    const { image, product_name, price, stock, categories } = req.body;
    
    console.log(req.body);
    
    if (!product_name || !price || !stock) {
        req.flash('message', "No puede dejar espacios vacios");
        req.flash('alertType', "alert-danger");
        return res.redirect(req.originalUrl);
    };
    // console.log(categories);
    if (categories == null){
        req.flash('message', "Debe seleccionar al menos una categoria");
        req.flash('alertType', "alert-warning");
        return res.redirect(req.originalUrl);
    }

    await db.query("SELECT name FROM producto WHERE name = ?", [product_name], async (error, result) => {
        if (error)
        console.log(error);
        
        if (result.length > 0)
            return res.render('./admin/products/add_product', {
                message: "El producto ya existe",
                alertType: "alert-danger",
            });

        // console.log(typeof(hashedPassword));
        // console.log(hashedPassword.length);

        await db.query('INSERT INTO producto SET ?', { name: product_name, price: price, stock: stock }, async (error, result) => {
            if (error)
                console.log(error);

            else {
                await db.query("SELECT id FROM producto WHERE name = ?" , [product_name], async (error, result) => {
                    if (error)
                        console.log(error);

                    let p_id = result;
                    // console.log("last id: ", p_ids);
                    product_id = p_id[0].id;
                    console.log("prod id: ", product_id);
                    
                    let cat_type = typeof (categories);
                    
                    if(cat_type.includes('obj')) {
                        categories.forEach(async category_id => {
                        // console.log(category_id);
                        await db.query('INSERT INTO clasificacion SET ?', { cat_id: category_id, prod_id: product_id });
                        });
                    }
                    else {
                        await db.query('INSERT INTO clasificacion SET ?', { cat_id: categories, prod_id: product_id });
                        
                    }
                    req.flash('message', "El usuario ha sido registrado correctamente, puede Iniciar Sesión.");
                    req.flash('alertType', "alert-success");
                    return res.redirect('/admin/products');
                });

                // XCONSOEL TYPEOF CATEGORIES

            }

        });
    });

    // res.send("ok");
}