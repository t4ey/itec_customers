const { db } = require("../../database/database");

exports.add_to_shopping_cart = async (req, res) => {
    const { id } = req.params;
    const product_id = id;
    const client_id = res.locals.user.id;
    console.log('id : ', client_id)
    console.log('p:id : ', product_id)
    const { quantity } = req.body;

    console.log(quantity);

    if (!quantity || (quantity > 50) || (quantity < 0) || !client_id) {
        req.flash('message', "Algo salio mal");
        req.flash('alertType', "alert-warning");
        return res.redirect('/marketplace/product/' + product_id);
    }

    await db.query("SELECT * FROM cart_shopping WHERE client_id = ? AND producto_id = ?", [client_id, product_id], async (error, result) => {
        if (error)
            console.log(error);

        // console.log('result', result);
        if (result.length > 0) {
            req.flash('message', "Ya ha añadido este producto al carrito de compras");
            req.flash('alertType', "alert-danger");
            return res.redirect('back');
        }

        db.query('INSERT INTO cart_shopping SET ?', { client_id: client_id, producto_id: product_id, cantidad: quantity }, (error, result) => {
            if (error)
                console.log(error);

            else {
                req.flash('message', "Producto añadido.");
                req.flash('alertType', "alert-success");
                return res.redirect('/marketplace/product/' + product_id);
            }

        });
    });

    // res.send("ok");
}

exports.delete_cart_product = async (req, res) => {
    const { id } = req.params;
    const product_id = id;
    const client_id = res.locals.user.id;

    await db.query('DELETE FROM cart_shopping WHERE client_id = ? AND producto_id = ?', [client_id, product_id]);

    req.flash('message', 'Producto Eliminado');
    req.flash('alertType', 'alert-success');
    res.redirect('/marketplace/cart_shopping');
}