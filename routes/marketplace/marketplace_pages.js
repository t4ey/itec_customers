const { db } = require("../../database/database");

const date = require('date-and-time');

// FUNCIONS

    // pagination funcion

async function pagination(db_query, req, res) {

    const db_result = await db.query(`${db_query}`);

    if(db_result.length <=0) {
        return { status: "no results" }; 
        req.flash('message', 'no se encontro ningún producto');
        req.flash('alertType', 'alert-danger');
        return res.redirect('/marketplace');
        // res.locals.products = null;
        // console.log("user checked", req.originalUrl);
        // console.log(await db.query("SELECT * FROM client WHERE id = 4"));
    }

    const resultsPerPage = 15;
    const numberOfResults = db_result.length;
    const numberOfPages = Math.ceil(numberOfResults / resultsPerPage);

    let page = req.query.page ? Number(req.query.page) : 1;
    console.log("query page: ", req.query.page);
    if(Number.isNaN(page)) 
        page = 1;
    
    // console.log("current_page: ", page, "N of pages: " + numberOfPages, numberOfResults,numberOfResults / resultsPerPage);
    console.log(req.originalUrl);
    if(page > numberOfPages) {
        // redirect inserting query number
        console.log("page: ", page, " page more than the minimunPages");
        return {status:"return if over pages", numberOfPages};
    } else if (page < 1) {
        console.log("page: ", page, " page less than the minimunPages");
        return {status:"return if lower pages", numberOfPages};
    }
    else {
        {status: ""}
        console.log("None of the page security conditions matched");
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
    // const category = req.query.category;
    const {search, page, category} = req.query;

    console.log(" querys", search, page, category);

    let categories = await db.query("SELECT * FROM categoria");
    let products;
    let pagination_format;
    let hasFilter;

    if(category) {
        // get id from products in the same category
        // console.log("category??????");
        if (category > categories[categories.length - 1] || category < 0 || Number.isNaN(category)) {
            console.log("categories checker: ", category, categories.length)
            return res.redirect('/marketplace');
        }

        const p_cat = await db.query("SELECT prod_id FROM clasificacion WHERE cat_id = ?", [category]);
        let p_cat_list = [];
        for (var i = 0; i < p_cat.length; i++) {
            p_cat_list.push(p_cat[i].prod_id);
        }

        // get products

        if (p_cat.length < 1) {
            return res.render('./marketplace/market.hbs', {
                categories: categories,
                products: products,
                message: message,
                alertType: alertType,
            });
        }

        // products = await db.query(`SELECT * FROM producto WHERE id IN (${p_cat_list})`);

        // pagination

        pagination_format = await pagination(`SELECT * FROM producto WHERE id IN (${p_cat_list})`, req, res);
        hasFilter = {category: category};

        // in case out of page 

        if (pagination_format.status == "return if over pages") { 
            return res.redirect('/marketplace' + '?page=' + encodeURIComponent(pagination_format.numberOfPages));
        }
        else if (pagination_format.status == "return if lower pages"){
            return res.redirect('/marketplace' + '?page=' + encodeURIComponent(1))
        }
        else if (pagination_format.status == "no results") {
            req.flash('message', 'no se encontro ningún producto');
            req.flash('alertType', 'alert-danger');
            return res.redirect('/marketplace');
        }
        // console.log("pcat : ", p_cat);
        // console.log(pagination_format);
    }
    else if (search) {
        // const products = await db.query("SELECT * FROM producto WHERE name LIKE '%" + search_string + "%'");
        // pagination
        // console.log("with_search :", search);
        pagination_format = await pagination("SELECT * FROM producto WHERE name LIKE '%" + search + "%'", req, res);
        hasFilter = {search: search};
        
        if (pagination_format.status == "return if over pages") {
            return res.redirect('/marketplace' + '?page=' + encodeURIComponent(pagination_format.numberOfPages));
        }
        else if (pagination_format.status == "return if lower pages") {
            return res.redirect('/marketplace' + '?page=' + encodeURIComponent(1))
        }
        else if (pagination_format.status == "no results") {
            req.flash('message', 'no se encontro ningún producto');
            req.flash('alertType', 'alert-danger');
            return res.redirect('/marketplace');
        }
    }
    else {
        // default state

        // pagination
        // console.log("deffff");
        pagination_format = await pagination('SELECT * FROM producto', req, res);
        hasFilter = false;
        
        if (pagination_format.status == "return if over pages") {
            return res.redirect('/marketplace' + '?page=' + encodeURIComponent(pagination_format.numberOfPages));
        }
        else if (pagination_format.status == "return if lower pages") {
            return res.redirect('/marketplace' + '?page=' + encodeURIComponent(1))
        }
        else if (pagination_format.status == "no results") {
            req.flash('message', 'no se encontro ningún producto');
            req.flash('alertType', 'alert-danger');
            return res.redirect('/marketplace');
        }
        
    }
    const pagination_data = {
        page: pagination_format.page,
        numberOfPages: pagination_format.numberOfPages,
        iterator: pagination_format.iterator,
        endingLink: pagination_format.endingLink
    }
    // console.log(pagination_format);

    // pagination bar
    const pag_bar = pagination_bar(pagination_data);
    pag_bar.filter = hasFilter;
    console.log(pag_bar);

    // end pagination

    products = pagination_format.result;
    
    // adding the stock state that lefts

    for (var i = 0; i < products.length; i++) {

        if (products[i].stock <= 5 && products[i].stock > 0) {
            products[i].little_stock = true;
            // console.log("little product", products[i].little_stock);
        }
    }
    
    // console.log(products);
    // console.log(categories);
    console.log("sending data");
    return res.render('./marketplace/market.hbs', {
        categories: categories,
        products: products,
        message: message,
        alertType: alertType,
        pagination_bar: pag_bar,
    });
}

exports.checkout = async (req, res) => {
    const client_id = res.locals.user.id;
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    const cart_products = await db.query("SELECT * FROM producto JOIN cart_shopping ON producto.id = cart_shopping.producto_id WHERE client_id = ?", [client_id]);

    let total_cash = 0;
    let n_products = 0;

    for (var i = 0; i < cart_products.length; i++) {
        total_cash += cart_products[i].price * cart_products[i].cantidad;
        cart_products[i].total = parseFloat((cart_products[i].price * cart_products[i].cantidad).toFixed(2));
        n_products++;
    }

    // let hasOrder = false;
    // const client_orders = await db.query("SELECT * FROM pedido WHERE client_id = ?", [client_id]);
    // console.log(client_orders[client_orders.length - 1].status);
    
    // if (!(client_orders[client_orders.length - 1].status == 'canceled') && !(client_orders[client_orders.length - 1].status == 'completed'))
    //     hasOrder = true;
    // else { hasOrder = false }

    return res.render('./marketplace/checkout.hbs', {
        products: cart_products,
        message: message,
        alertType: alertType,
        total_cash: parseFloat(total_cash.toFixed(2)),
        n_products,
        payment_select: (req.query.payment_method == "cash") ? '<i class="fa-solid fa-money-bills" style="color: #20c200;"></i>  En Efectivo' : "Seleccionar",
        payment_select_cash: (req.query.payment_method == "cash") ? true : false,
    });
}

exports.order = async (req, res) => {
    const client_id = res.locals.user.id;
    console.log('id : ', client_id)
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    await db.query("SELECT * FROM pedido WHERE client_id = ? ORDER BY id DESC LIMIT 1", [client_id], async (error, result) => {
        if(error)
            console.log(error)

        const order_details = result[0];
        
        // if there's no order redirect directly
        if ((order_details.status == 'canceled') || (order_details.status == 'completed'))
        return res.render('./marketplace/order.hbs', {
            message: message,
            alertType: alertType,

            order: false,
            order_details,
        });
 
        // setting the status to be available on hbs file
        const n_products = (await db.query(`SELECT COUNT(pedido_id) as n_products FROM detalle_pedido WHERE pedido_id = ${order_details.id}`))[0].n_products;
        order_details.n_products = n_products;
        
        switch (order_details.status ) {
            case 'new':
                order_details.new = true;
                break;
            case 'completed':
                order_details.completed = true;
                break;
            case 'ready-to-pay':
                order_details.ready_to_pay = true;
                break;
            case 'canceled':
                order_details.canceled = true;
                break;
            default:
                order_details.new = true;
                break;
        }

        // set two days later and formatting it
        const twoDaysLater = new Date();
        twoDaysLater.setDate(twoDaysLater.getDate() + 2);
        order_details.expiration_date = date.format(twoDaysLater, 'YYYY-MM-DD');

        console.log(order_details);

        // console.log(products);
        // console.log(cart_products);
        // console.log(categories);
        return res.render('./marketplace/order.hbs', {
            message: message,
            alertType: alertType,
    
            order: true,
            order_details,
        });
    });
}

// post requests

exports.searchInMarketplace = async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');
    // console.log("name : ", search_string);
    const cat_or_search = req.body;
    
    if (cat_or_search.category) {
        return res.redirect("/marketplace?category=" + encodeURIComponent(cat_or_search.category));  
    }

    else if (cat_or_search.search) {
        return res.redirect("/marketplace?search=" + encodeURIComponent(cat_or_search.search));
    } else {
        req.flash('message', 'no se encontro ningún producto');
        req.flash('alertType', 'alert-danger');
        return res.redirect('/marketplace');
        // res.locals.products = null;
        // console.log("user checked", req.originalUrl);
        // console.log(await db.query("SELECT * FROM client WHERE id = 4"));
    }

}

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

    const orderActive = (await db.query(`SELECT * FROM pedido WHERE client_id = ${client_id} ORDER BY id DESC LIMIT 1`))[0].status;
    console.log(orderActive);

    if ((orderActive == 'new') || (orderActive == 'ready-to-pay')) {
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
            req.flash('alertType', "alert-warning");
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

exports.update_quantity = async (req, res) => {
    const client_id = res.locals.user.id;
    console.log('id : ', client_id)
    
    const { action, product_id, custom } = req.body;
    
    console.log('action ', action);
    console.log('p:id : ', product_id);

    await db.query(`SELECT * FROM cart_shopping WHERE producto_id = ${product_id} AND client_id = ${client_id}`, async(error, result) => {
        if(error)
            console.log(error);

        const product = result[0];

        if(action == undefined || custom == product.cantidad || custom == "") {
            return res.json({ reloadPage: false });
        }

        console.log("before ", product);
        // updatding the product by plus 1 

        if(action == "increment") {
            product.cantidad++;
            console.log("after ", product);
            await db.query(`UPDATE cart_shopping SET cantidad = ${product.cantidad} WHERE producto_id = ${product_id} AND client_id = ${client_id}`);
        } else if( action == "decrement") {
            product.cantidad--;
            await db.query(`UPDATE cart_shopping SET cantidad = ${product.cantidad} WHERE producto_id = ${product_id} AND client_id = ${client_id}`);
        } else if(action == "custom") {
            product.cantidad = custom;
            await db.query(`UPDATE cart_shopping SET cantidad = ${product.cantidad} WHERE producto_id = ${product_id} AND client_id = ${client_id}`);
        }

        // const result_p = await db.query(`SELECT * FROM cart_shopping WHERE producto_id = ${product_id} AND client_id = ${client_id}`);

        return res.json({ reloadPage: true });
    });
    
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

    const { payment_method } = req.body;

    console.log("pm: ", payment_method);

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

        if (payment_method != "cash") {
            console.log("pm: ", payment_method);
            req.flash('message', "Debe seleccionar un método de pago");
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

            let ordered_products = (await db.query("SELECT * FROM producto WHERE id IN (?)", [list_id_db_cart_products]));

            // make order if there's enough stock
            for(var i = 0;i<ordered_products.length;i++) {
                console.log("stock???", ordered_products[i])
                if (db_cart_products[i].cantidad > ordered_products[i].stock) {
                    req.flash('message', "No hay stock suficiente del producto " + "\"" + ordered_products[i].name + "\"");
                    req.flash('alertType', "alert-danger");
                    return res.redirect('/marketplace/cart_shopping');
                }
            }

            // if there's stock substract the number of items to order on the "producto db" to make the accountability of stock
            for (var i = 0; i < ordered_products.length; i++)
                await db.query('UPDATE producto SET stock = ? WHERE id = ?', [ordered_products[i].stock - db_cart_products[i].cantidad, ordered_products[i].id]);

            let product_prices = (await db.query("SELECT price FROM producto WHERE id IN (?)", [list_id_db_cart_products]));
            // console.log(product_prices);
            
            let total_cash = 0;
            
            for (var i = 0; i < db_cart_products.length; i++) {
                total_cash += product_prices[i].price * db_cart_products[i].cantidad;
            }
            
            for(var i = 0; i < db_cart_products.length; i++) {
                await db.query('UPDATE cart_shopping SET cantidad = ? WHERE client_id = ? AND producto_id = ?', [db_cart_products[i].cantidad, client_id, db_cart_products[i].producto_id]);
            }
            // make order
            await db.query('INSERT INTO pedido SET ?', {total_amount: total_cash, client_id: client_id});
            
            const pedidos_id = (await db.query("SELECT id FROM pedido WHERE client_id = ?", [client_id]));
            const last_pedido_id = pedidos_id[pedidos_id.length - 1].id;
            
            for (var i = 0; i < db_cart_products.length; i++) {
                await db.query('INSERT INTO detalle_pedido SET ?', { pedido_id: last_pedido_id, producto_id: db_cart_products[i].producto_id, cantidad: db_cart_products[i].cantidad });
            }

            // set two days later and formatting it
            const twoDaysLater = new Date();
            twoDaysLater.setDate(twoDaysLater.getDate() + 2);

            req.flash('message', `Se ha realizado el Pedido, Puede pasar a recoger el pedido hasta el '${date.format(twoDaysLater, 'YYYY-MM-DD') }'`);
            // date.format(twoDaysLater.setDate(today.getDate() + 2), 'YYYY-MM-DD');
            
            req.flash('alertType', "alert-success");
            // return res.redirect('/marketplace/product/' + product_id);
            return res.redirect('/marketplace/cart_shopping');
        });
    });
    
    // res.send("ok");
}

exports.cancel_order = async (req, res) => {
    const client_id = res.locals.user.id;
    console.log('id : ', client_id);

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
        return res.redirect('/marketplace');
    });

    // res.send("ok");
}