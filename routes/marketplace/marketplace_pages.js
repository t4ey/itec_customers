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

exports.make_order = async (req, res) => {
    const client_id = res.locals.user.id;
    console.log('id : ', client_id);

    const cart_products = req.body;

    console.log(cart_products);

    for(var i = 0; i < cart_products.length; i++) {
        if (!cart_products.quantity[i] || (cart_products.quantity[i] > 50) || (cart_products.quantity[i] < 0) || !client_id) {
            req.flash('message', "Algo salio mal");
            req.flash('alertType', "alert-warning");
            return res.redirect('/marketplace/cart_shopping');
        }
    }

    await db.query("SELECT * FROM pedido WHERE client_id = ?", [client_id], async (error, result) => {
        if (error)
            console.log(error);

        if (result.length > 0) {
            req.flash('message', "El pedido ya fue realizado");
            req.flash('alertType', "alert-danger");
            return res.redirect('back');
        }
        
        await db.query("SELECT * FROM cart_shopping WHERE client_id = ?", [client_id], async (error, result) => {
            if (error)
            console.log(error);
            
            console.log('result', result);
            const db_cart_products = result;
            // if (result.length > 0) {
                //     req.flash('message', "Ya ha añadido este producto al carrito de compras");
                //     req.flash('alertType', "alert-danger");
            //     return res.redirect('back');
            // }
            let product_prices = [];
            for( var i = 0; i < db_cart_products.length; i++){
                product_prices.push((await db.query("SELECT price FROM producto WHERE id = ?", [db_cart_products[i].producto_id]))[0]);
            }
            // console.log(product_prices);
            
            let total_cash = 0;
            
            for (var i = 0; i < db_cart_products.length; i++) {
                total_cash += product_prices[i].price * cart_products.quantity[i];
            }
            
            for(var i = 0; i < db_cart_products.length; i++) {
                await db.query('UPDATE cart_shopping SET cantidad = ? WHERE client_id = ? AND producto_id = ?', [cart_products.quantity[i], client_id, db_cart_products[i].producto_id]);
            }
            // make order
            await db.query('INSERT INTO pedido SET ?', {total_amount: total_cash, client_id: client_id});
            
            const pedido_id = (await db.query("SELECT id FROM pedido WHERE client_id = ?", [client_id]))[0].id;
            
            for (var i = 0; i < db_cart_products.length; i++) {
                await db.query('INSERT INTO detalle_pedido SET ?', { pedido_id: pedido_id, producto_id: db_cart_products[i].producto_id, cantidad: cart_products.quantity[i] });
            }
            req.flash('message', "Se ha realizado el Pedido, Puede pasar a recoger el pedido hasta el 'fecha'");
            req.flash('alertType', "alert-success");
            // return res.redirect('/marketplace/product/' + product_id);
            return res.redirect('back');
        });
    });
    
    // res.send("ok");
}

exports.cancel_order = async (req, res) => {
    const client_id = res.locals.user.id;
    console.log('id : ', client_id);

    const cart_products = req.body;

    console.log(cart_products);

    await db.query("SELECT id FROM pedido WHERE client_id = ?", [client_id], async (error, result) => {
        if (error)
            console.log(error);

        const pedido_id = result[0].id;
        
        await db.query("DELETE FROM pedido WHERE client_id = ?", [client_id]);
        
        const db_cart_products = await db.query("SELECT * FROM detalle_pedido WHERE pedido_id = ?", [pedido_id]);

        await db.query("DELETE FROM cart_shopping WHERE client_id = ?", [client_id]);
        await db.query("DELETE FROM detalle_pedido WHERE pedido_id = ?", [pedido_id]);

        // console.log(product_prices);

        req.flash('message', "El pedido fue cancelado");
        req.flash('alertType', "alert-success");
        // return res.redirect('/marketplace/product/' + product_id);
        return res.redirect('back');
    });

    // res.send("ok");
}