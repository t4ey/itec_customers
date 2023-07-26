const { db } = require("../../database/database");

// FUNCIONS

    // pagination funcion

async function pagination(db_query, req, res) {

    const db_result = await db.query(`${db_query}`);

    const resultsPerPage = 15;
    const numberOfResults = db_result.length;
    const numberOfPages = Math.ceil(numberOfResults / resultsPerPage);

    let page = req.query.page ? Number(req.query.page) : 1;

    if(Number.isNaN(page)) 
        page = 1;

    if(page > numberOfPages) {
        // redirect inserting query number
        res.redirect('back'+'/?page='+encodeURIComponent(numberOfPages));
    } else if (page < 1) {
        res.redirect('back' + '/?page=' + encodeURIComponent(1));
    }

    // setting up result start and end limits according to the page number

    const startLimit = (page - 1) * resultsPerPage;

    const get_page_result = await db.query(`${db_query} LIMIT ${startLimit}, ${resultsPerPage}`);

    // bar iteration for pagination numbers and buttons foward and backward

    let iterator = (page - 5) < 1 ? 1 : page - 5;
    let endingLink = (iterator + 9) <= numberOfPages ? (iterator + 0) : page + (numberOfPages - page);
     

    let result = {
        result: get_page_result,
        page,
        numberOfPages,
        iterator,
        endingLink
    };

    return result;
}

function pagination_bar(pagination_data){
    let result = pagination_data;

    if(result.page > 1){
        result.previous = result.page - 1;
    } else {
        result.previous = false;
    }

    if (result.page < result.numberOfPages) {
        result.next = result.page + 1;
    } else {
        result.next = false;
    }

    result.display_nums = [];
    result.currentPageActive = [];
    for (let i = 0; i < result.endingLink; i++) {
        if (i+1 == result.page)
            result.currentPageActive.push(true);
        else
            result.currentPageActive.push(false);

        result.display_nums.push(i + 1);
    }


    return result;
}

// GET requests

exports.marketplace = async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    let categories = await db.query("SELECT * FROM categoria");

    // pagination

    const pagination_format = await pagination('SELECT * FROM producto', req, res);
    const pagination_data = {
        page: pagination_format.page,
        numberOfPages: pagination_format.numberOfPages,
        iterator: pagination_format.iterator,
        endingLink: pagination_format.endingLink
    }
    // console.log(pagination_format);

    // pagination bar
    const pag_bar = pagination_bar(pagination_data);
    console.log(pag_bar);

    // end pagination

    let products = pagination_format.result;

    for (var i = 0; i < products.length; i++) {

        if (products[i].stock <= 5 && products[i].stock > 0) {
            products[i].little_stock = true;
            // console.log("little product", products[i].little_stock);
        }
    }

    // console.log(products);
    // console.log(categories);
    res.render('./marketplace/market.hbs', {
        categories: categories,
        products: products,
        message: message,
        alertType: alertType,
        pagination_bar: pag_bar,
    });
}

// post requests

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

    // if there's an order active

    const orderActive = await db.query("SELECT * FROM pedido WHERE client_id = ?" , [client_id]);
    // console.log(orderActive);

    if ((orderActive[orderActive.length - 1] == 'canceled') || (orderActive[orderActive.length - 1] == 'completed') || (orderActive[orderActive.length - 1] == 'new')) {
        req.flash('message', "Tiene un pedido en curso, no puede añadir o eliminar productos hasta que el pedido sea completado");
        req.flash('alertType', "alert-warning");
        return res.redirect('/marketplace/cart_shopping');
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
                return res.redirect('back');
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

        const last_order = result[result.length - 1];
        console.log(last_order);
        if (last_order.status != 'canceled' && last_order.status != 'completed') {
            req.flash('message', "El pedido ya fue realizado");
            req.flash('alertType', "alert-danger");
            return res.redirect('back');
        }
        
        await db.query("SELECT * FROM cart_shopping WHERE client_id = ?", [client_id], async (error, result) => {
            if (error)
            console.log(error);
            
            console.log('result', result);
            const db_cart_products = result;

            const list_id_db_cart_products = [];
            for(var i = 0; i < db_cart_products.length;i++){
                list_id_db_cart_products.push(db_cart_products[i].producto_id);
            }

            // make order if there's enough stock
            let ordered_products = (await db.query("SELECT * FROM producto WHERE id IN (?)", [list_id_db_cart_products]));
            for(var i = 0;i<ordered_products.length;i++) {
                console.log("stock???", ordered_products[i])
                if (cart_products.quantity[i] > ordered_products[i].stock) {
                    req.flash('message', "No hay stock suficiente del producto " + "\"" + ordered_products[i].name + "\"");
                    req.flash('alertType', "alert-danger");
                    return res.redirect('back');
                }
            }

            // if there's stock substract the number of items to order on the "producto db" to make the accountability of stock
            for (var i = 0; i < ordered_products.length; i++)
                await db.query('UPDATE producto SET stock = ? WHERE id = ?', [ordered_products[i].stock - cart_products.quantity[i], ordered_products[i].id]);

            let product_prices = (await db.query("SELECT price FROM producto WHERE id IN (?)", [list_id_db_cart_products]));
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
            
            const pedidos_id = (await db.query("SELECT id FROM pedido WHERE client_id = ?", [client_id]));
            const last_pedido_id = pedidos_id[pedidos_id.length - 1].id;
            
            for (var i = 0; i < db_cart_products.length; i++) {
                await db.query('INSERT INTO detalle_pedido SET ?', { pedido_id: last_pedido_id, producto_id: db_cart_products[i].producto_id, cantidad: cart_products.quantity[i] });
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

        const pedido_id = result[result.length - 1].id;
        
        // make the accountability for the stock on the "producto db"

        const db_cart_products = await db.query("SELECT * FROM cart_shopping WHERE client_id = ?", [client_id]);

        const list_id_db_cart_products = [];
        for (var i = 0; i < db_cart_products.length; i++) {
            list_id_db_cart_products.push(db_cart_products[i].producto_id);
        }
        
        // console.log("cantidad:::", db_cart_products.cantidad);

        const ordered_products = await db.query("SELECT * FROM producto WHERE id IN (?)", [list_id_db_cart_products]);

        for (var i = 0; i < ordered_products.length; i++)
            await db.query('UPDATE producto SET stock = ? WHERE id = ?', [ordered_products[i].stock + db_cart_products[i].cantidad, ordered_products[i].id]);


        await db.query("DELETE FROM cart_shopping WHERE client_id = ?", [client_id]);
        
        // --- const db_cart_products = await db.query("SELECT * FROM detalle_pedido WHERE pedido_id = ?", [pedido_id]);
        
        await db.query("UPDATE pedido SET ? WHERE id = ?", [{status: 'canceled'}, pedido_id]);

        // --- await db.query("DELETE FROM detalle_pedido WHERE pedido_id = ?", [pedido_id]);

        // console.log(product_prices);

        req.flash('message', "El pedido fue cancelado");
        req.flash('alertType', "alert-success");
        // return res.redirect('/marketplace/product/' + product_id);
        return res.redirect('back');
    });

    // res.send("ok");
}