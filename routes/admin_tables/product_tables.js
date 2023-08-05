const { db } = require("../../database/database");

// timestamp formatter
const timeAgo = require('timeago.js/dist/timeago.full.min');
// const { es } = require('timeago.js/lib/lang/es').default;
// timeAgo.register('es', es);
// const date = timeAgo.format('2016-06-12', 'fr')
// console.log(date);
// const { es } = require('javascript-time-ago/locale/es');

// timeAgo.addDefaultLocale(es);

// resize the given image
const sharp = require('sharp');

// image resolutions

const img_width = 350;  // image output resolution in pixels
const img_height = 250;
const img_micro_width = 80;
const img_micro_height = Math.round(img_micro_width * (((img_height * 100) / img_width) / 100));

// FUNCTIONS

// pagination funcion

async function pagination(db_query, req, res) {

    const db_result = await db.query(`${db_query}`);

    if (db_result.length <= 0) {
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
    if (Number.isNaN(page))
        page = 1;

    // console.log("current_page: ", page, "N of pages: " + numberOfPages, numberOfResults,numberOfResults / resultsPerPage);
    console.log(req.originalUrl);
    if (page > numberOfPages) {
        // redirect inserting query number
        console.log("page: ", page, " page more than the minimunPages");
        return { status: "return if over pages", numberOfPages };
    } else if (page < 1) {
        console.log("page: ", page, " page less than the minimunPages");
        return { status: "return if lower pages", numberOfPages };
    }
    else {
        { status: "" }
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

function pagination_bar(pagination_data) {
    let result = pagination_data;

    if (result.page > 1) {
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
        if (i + 1 == result.page)
            result.currentPageActive.push(true);
        else
            result.currentPageActive.push(false);

        result.display_nums.push(i + 1);
    }


    return result;
}


// searching the micro image

const micro_img_dir = (img_dir) => {
    let last_ch = img_dir.lastIndexOf("/") + 1;
    return img_dir.slice(0, last_ch) + "micro-" + img_dir.slice(last_ch);
}

const resize_image = (file, filename,width = 350, height = 250) => {
    return sharp(file.buffer).resize(width, height, {
        fit: sharp.fit.fill,
        withoutEnlargement: true
    }).toFormat('jpg').toFile('./public/images/products/' + filename +  '.jpg');
}

exports.products = async (req, res) => {
    const filter = req.params.filter;
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    // console.log(message);
    let products = {}
    products.all = await db.query("SELECT * FROM producto");

    // filter's bar counter

    products.published = [];
    products.out_of_stock = [];
    // console.log("filtered prods: ", products);

    for (var i = 0; i < products.all.length; i++) {
        // insert in filters ( published && out of stock)
        // console.log(products.all[i].stock > 0);
        if (products.all[i].stock > 0) {
            products.published.push(products.all[i]);
        }
        else {
            products.out_of_stock.push(products.all[i]);
        }
    }

    let filters = {};

    filters.all = products.all.length;
    filters.published = products.published.length;
    filters.out_of_stock = products.out_of_stock.length;
    
    // pagination

    // console.log("deffff");
    // data query request await db.query(`SELECT * FROM pedido WHERE status = ${data} ORDER BY id DESC`);
    const pagination_format = await pagination('SELECT * FROM producto', req, res);
    const link_page = res.originalUrl;

    // if try to ingress to a different page range
    if (pagination_format.status == "return if over pages") {
        return res.redirect(link_page + '?page=' + encodeURIComponent(pagination_format.numberOfPages));
    }
    else if (pagination_format.status == "return if lower pages") {
        return res.redirect(link_page + '?page=' + encodeURIComponent(1))
    }
    else if (pagination_format.status == "no results") {
        req.flash('message', 'no se encontro ningún producto');
        req.flash('alertType', 'alert-danger');
        return res.redirect(link_page);
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
    pag_bar.link = link_page;
    console.log(pag_bar);

    // end pagination
    products = pagination_format.result;
    console.log("result length: ",pagination_format.result.length);


    // display categories part

    if(products.length > 0) {
        for(var i = 0; i < products.length; i++){
            products[i].img_dir = micro_img_dir(products[i].img_dir); // change to micro img dir
            
            product_category_ids = await db.query("SELECT cat_id FROM clasificacion WHERE prod_id = ?", [products[i].id]);
            
            let name_categories = [];
            // console.log(product_category_ids);
            // console.log(cat_ids);

            for(var j = 0; j < product_category_ids.length; j++) {
                if(product_category_ids[j]) {
                    let get_cat_name = await db.query("SELECT name FROM categoria WHERE id = ?", [product_category_ids[j].cat_id]);
                    // console.log(get_cat_name[0].name);
                    name_categories.push(get_cat_name[0].name);
                    // console.log("categories push: ", categories);
                }

            }
            products[i].categories = name_categories;
            // console.log(products[i]);
            // console.log("next id", categories);
        }    
    }

    // console.log(products);

    // console.log(result);
    return res.render('./admin/products/products.hbs', {
        message: message,
        alertType: alertType, 
        products: products,
        filters: filters,
        pagination_bar: pag_bar,
    });
}

exports.filter_products = async (req, res) => {
    //const orders = await db.query("SELECT * FROM pedido WHERE status = ? ORDER BY id DESC", [filter]);
    //const filter_filter_orders = await db.query("SELECT * FROM pedido ORDER BY id DESC");
    const filter = req.params.filter;
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    // console.log(message);
    let products = {}
    products.all = await db.query("SELECT * FROM producto");

    // filter's bar counter

    products.published = [];
    products.out_of_stock = [];
    // console.log("filtered prods: ", products);

    for (var i = 0; i < products.all.length; i++) {
        // insert in filters ( published && out of stock)
        // console.log(products.all[i].stock > 0);
        if (products.all[i].stock > 0) {
            products.published.push(products.all[i]);
        }
        else {
            products.out_of_stock.push(products.all[i]);
        }
    }

    let filters = {};

    filters.all = products.all.length;
    filters.published = products.published.length;
    filters.out_of_stock = products.out_of_stock.length;
    
    // pagination
    // filtering queries
    let pagination_format;
    if (filter == undefined || filter == "all") {
        console.log("no filter ");
        return res.redirect("/admin/products");
    }
    else if (filter == "published") {
        pagination_format = await pagination(`SELECT * FROM producto WHERE stock >= 1`, req, res);
    }
    else if (filter == "out_of_stock") {
        pagination_format = await pagination(`SELECT * FROM producto WHERE stock = 0`, req, res);
    }

    // console.log("deffff");
    // data query request await db.query(`SELECT * FROM pedido WHERE status = ${data} ORDER BY id DESC`);
    // pagination_format = await pagination(`SELECT * FROM pedido WHERE status = '${filter}' ORDER BY id DESC`, req, res);
    const link_page = res.originalUrl;

    // if try to ingress to a different page range
    if (pagination_format.status == "return if over pages") {
        return res.redirect(link_page + '?page=' + encodeURIComponent(pagination_format.numberOfPages));
    }
    else if (pagination_format.status == "return if lower pages") {
        return res.redirect(link_page + '?page=' + encodeURIComponent(1))
    }
    else if (pagination_format.status == "no results") {
        req.flash('message', 'no se encontro ningún producto');
        req.flash('alertType', 'alert-danger');
        return res.redirect(link_page);
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
    pag_bar.link = link_page;
    console.log(pag_bar);

    // end pagination
    
    // filters.all = products.all.length 
    // filters.published products.published
    // products.f_
    products = pagination_format.result;
    console.log(products);
    console.log(filter);

    // display categories part

    if (products.length > 0) {
        for (var i = 0; i < products.length; i++) {
            products[i].img_dir = micro_img_dir(products[i].img_dir); // change to micro img dir

            product_category_ids = await db.query("SELECT cat_id FROM clasificacion WHERE prod_id = ?", [products[i].id]);

            let name_categories = [];
            // console.log(product_category_ids);
            // console.log(cat_ids);

            for (var j = 0; j < product_category_ids.length; j++) {
                if (product_category_ids[j]) {
                    let get_cat_name = await db.query("SELECT name FROM categoria WHERE id = ?", [product_category_ids[j].cat_id]);
                    // console.log(get_cat_name[0].name);
                    name_categories.push(get_cat_name[0].name);
                    // console.log("categories push: ", categories);
                }

            }
            products[i].categories = name_categories;
            // console.log(products[i]);
            // console.log("next id", categories);
        }
    }

    // console.log(products);

    // console.log(result);
    return res.render('./admin/products/products.hbs', {
        message: message,
        alertType: alertType,
        products: products,
        filters: filters,
        pagination_bar: pag_bar,
    });
}

exports.add_product = async (req, res) => {
    console.log("img", req.file);

    const { product_name, price, stock, categories } = req.body;
    
    console.log(req.body);
    
    
    if ((!product_name || product_name == 'no image') || !price || !stock || !req.file) {
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
        
        if (result.length > 0){
            req.flash('message', "El producto ya existe");
            req.flash('alertType', "alert-warning");
            return res.redirect(req.originalUrl);
        }
        
        // console.log(typeof(hashedPassword));
        // console.log(hashedPassword.length);
        
        // resize and save the image

        if(req.file){
            await resize_image(req.file, product_name, img_width, img_height);
            await resize_image(req.file, "micro-" + product_name, img_micro_width, img_micro_height);
        }

        await db.query('INSERT INTO producto SET ?', { name: product_name, price: price, stock: stock, img_dir: ('/images/products/' + product_name + '.jpg') }, async (error, result) => {
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
                    req.flash('message', "Producto registrado exitosamente.");
                    req.flash('alertType', "alert-success");
                    return res.redirect('/admin/products');
                });

                // XCONSOEL TYPEOF CATEGORIES

            }

        });
    });

    // res.send("ok");
}

exports.edit_product = async (req, res) => {
    const { id } = req.params;
    const { product_name, price, stock, categories } = req.body;

    console.log(req.file);
    console.log(req.body);

    if ((!product_name || product_name == 'no image') || !price || !stock) {
        req.flash('message', "No puede dejar espacios vacios");
        req.flash('alertType', "alert-danger");
        return res.redirect(req.originalUrl);
    };
    // console.log(categories);
    if (categories == null) {
        req.flash('message', "Debe seleccionar al menos una categoria");
        req.flash('alertType', "alert-warning");
        return res.redirect(req.originalUrl);
    }

    await db.query("SELECT * FROM producto WHERE id = ?", [id], async (error, result) => {
        if (error)
            console.log(error);

        // console.log(typeof(hashedPassword));
        // console.log(hashedPassword.length);

        if(req.file) {
            await resize_image(req.file, product_name, img_width, img_height);
            await resize_image(req.file, "micro-" + product_name, img_micro_width, img_micro_height);
        }

        await db.query('UPDATE producto SET ? WHERE id = ' + id, { name: product_name, price: price, stock: stock, img_dir: ('/images/products/' + product_name + '.jpg') }, async (error, result) => {
            if (error)
                console.log(error);

            else {;
                product_id = id;
                console.log("prod id: ", product_id);

                let cat_type = typeof (categories);

                if (cat_type.includes('obj')) {
                    await db.query('DELETE FROM clasificacion WHERE prod_id = ?', [id]);
                    categories.forEach(async category_id => {
                        // console.log(category_id);
                        await db.query('INSERT INTO clasificacion SET ?', { cat_id: category_id, prod_id: product_id });
                    });
                }
                else {
                    await db.query('DELETE FROM clasificacion WHERE prod_id = ?', [id]);
                    await db.query('INSERT INTO clasificacion SET ?', { cat_id: categories, prod_id: product_id });
                }
                req.flash('message', "Se actulizó el producto exitosamente.");
                req.flash('alertType', "alert-success");
                return res.redirect(req.originalUrl);

                // XCONSOEL TYPEOF CATEGORIES

            }

        });
    });

    // res.send("ok");
}

exports.delete_product = async (req, res) => {
    const { id } = req.params;

    await db.query('DELETE FROM producto WHERE id = ?', [id]);

    req.flash('message', 'El producto a sido eliminado exitosamente');
    req.flash('alertType', 'alert-success');
    res.redirect('/admin/products');
}

// categories section

exports.categories = async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    // console.log(message);

    await db.query("SELECT * FROM categoria", async (error, result) => {
        if (error)
            console.log(error);
        // pagination

        // console.log("deffff");
        // data query request await db.query(`SELECT * FROM pedido WHERE status = ${data} ORDER BY id DESC`);
        const pagination_format = await pagination('SELECT * FROM categoria', req, res);
        const link_page = res.originalUrl;

        // if try to ingress to a different page range
        if (pagination_format.status == "return if over pages") {
            return res.redirect(link_page + '?page=' + encodeURIComponent(pagination_format.numberOfPages));
        }
        else if (pagination_format.status == "return if lower pages") {
            return res.redirect(link_page + '?page=' + encodeURIComponent(1))
        }
        else if (pagination_format.status == "no results") {
            req.flash('message', 'no se encontro ningún producto');
            req.flash('alertType', 'alert-danger');
            return res.redirect(link_page);
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
        pag_bar.link = link_page;
        console.log(pag_bar);

        // end pagination
        categorias = pagination_format.result;
        
        if (result) {
            // console.log(result);
            return res.render('./admin/products/categories.hbs', {
                categories: categorias,
                message: message,
                alertType: alertType,
                pagination_bar: pag_bar,
            });
        }
        else
            console.log("nop");

    });

}

exports.add_category = async (req, res) => {

    const { cat_name, description } = req.body;

    console.log(req.body);

    if (!cat_name || !description) {
        req.flash('message', "No puede dejar espacios vacios");
        req.flash('alertType', "alert-warning");
        return res.redirect('/admin/add_category');
    }

    await db.query("SELECT name FROM categoria WHERE name = ?", [cat_name], async (error, result) => {
        if (error)
            console.log(error);

        if (result.length > 0) {
            req.flash('message', "Ya hay una categoria existente con ese nombre.");
            req.flash('alertType', "alert-danger");
            return res.redirect('/admin/categories');
        }

        db.query('INSERT INTO categoria SET ?', { name: cat_name, description: description}, (error, result) => {
            if (error)
                console.log(error);
                
            else {
                req.flash('message', "La categoria ha sido registrada exitosamente.");
                req.flash('alertType', "alert-success");
                return res.redirect('/admin/categories');
            }

        });
    });

    // res.send("ok");
}

exports.edit_category_get_req = async (req, res) => {
    const { id } = req.params;
    const message = req.flash('message');
    const alertType = req.flash('alertType');
    const category = await db.query('SELECT * FROM categoria WHERE id = ?', [id]);
    console.log("category", category[0], id);


    let products = [];
    // pagination

    // join combination in MYSQL query
    // const get_prods = await db.query(`SELECT * FROM producto JOIN clasificacion ON producto.id = clasificacion.prod_id WHERE cat_id = ${id}`);

    // console.log("deffff");
    // data query request await db.query(`SELECT * FROM pedido WHERE status = ${data} ORDER BY id DESC`);
    const pagination_format = await pagination(`SELECT * FROM producto JOIN clasificacion ON producto.id = clasificacion.prod_id WHERE cat_id = ${id}`, req, res);
    const link_page = res.originalUrl;

    // if try to ingress to a different page range
    if (pagination_format.status == "return if over pages") {
        return res.redirect(link_page + '?page=' + encodeURIComponent(pagination_format.numberOfPages));
    }
    else if (pagination_format.status == "return if lower pages") {
        return res.redirect(link_page + '?page=' + encodeURIComponent(1))
    }
    else if (pagination_format.status == "no results") {
        console.log("products:", products);
        return res.render('./admin/products/edit_category', {
            message: message,
            alertType: alertType,
            category: category[0],
            products: products,
        });
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
    pag_bar.link = link_page;
    console.log(pag_bar);

    // end pagination
    products = pagination_format.result;
    console.log("result length: ", pagination_format.result.length);


    // display categories part

    if (products.length > 0) {
        for (var i = 0; i < products.length; i++) {
            products[i].img_dir = micro_img_dir(products[i].img_dir); // change to micro img dir

            product_category_ids = await db.query("SELECT cat_id FROM clasificacion WHERE prod_id = ?", [products[i].id]);

            let name_categories = [];
            // console.log(product_category_ids);
            // console.log(cat_ids);

            for (var j = 0; j < product_category_ids.length; j++) {
                if (product_category_ids[j]) {
                    let get_cat_name = await db.query("SELECT name FROM categoria WHERE id = ?", [product_category_ids[j].cat_id]);
                    // console.log(get_cat_name[0].name);
                    name_categories.push(get_cat_name[0].name);
                    // console.log("categories push: ", categories);
                }

            }
            products[i].categories = name_categories;
            // console.log(products[i]);
            // console.log("next id", categories);
        }
    }

    console.log("products:",products);

    // console.log(result);
    return res.render('./admin/products/edit_category', {
        message: message,
        alertType: alertType,
        category: category[0],
        products: products,
        pagination_bar: pag_bar,
    });
}

exports.edit_category = async (req, res) => {
    const {id} = req.params;
    const { cat_name, description } = req.body;

    console.log(req.body);

    if (!cat_name || !description) {
        req.flash('message', "No puede dejar espacios vacios");
        req.flash('alertType', "alert-warning");
        return res.redirect(req.originalUrl);
    }


    db.query('UPDATE categoria SET ? WHERE id = ' + id, [{ name: cat_name, description: description }], (error, result) => {
        if (error)
            console.log(error);

        else {
            req.flash('message', "Los cambios se aplicaron exitosamente.");
            req.flash('alertType', "alert-success");
            return res.redirect(req.originalUrl);
        }

    });
    // res.send("ok");
}

exports.delete_category = async (req, res) => {
    const { id } = req.params;

    await db.query('DELETE FROM categoria WHERE id = ?', [id]);

    req.flash('message', 'La categoria se eliminó exitosamente');
    req.flash('alertType', 'alert-success');
    res.redirect('/admin/categories');
}

exports.orders = async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    // console.log(message);
    

    await db.query("SELECT * FROM pedido ORDER BY id DESC", async (error, result) => {
        if (error)
            console.log(error);

        // pagination

        // console.log("deffff");
        const pagination_format = await pagination('SELECT * FROM pedido ORDER BY id DESC', req, res);
        const link_page = "/admin/orders";

            // if try to ingress to a different page range
        if (pagination_format.status == "return if over pages") {
            return res.redirect(link_page + '?page=' + encodeURIComponent(pagination_format.numberOfPages));
        }
        else if (pagination_format.status == "return if lower pages") {
            return res.redirect(link_page + '?page=' + encodeURIComponent(1))
        }
        else if (pagination_format.status == "no results") {
            req.flash('message', 'no se encontro ningún producto');
            req.flash('alertType', 'alert-danger');
            return res.redirect(link_page);
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
        pag_bar.link = link_page;
        console.log(pag_bar);

        // end pagination

        const orders = pagination_format.result;

        if(!(orders.length > 0)) {
            return res.render('./admin/products/orders.hbs', {
                message: message,
                alertType: alertType,
                orders: orders,
            });

        }
        console.log("orders",orders);

        let filters = {};

        filters.all = orders.length;
        filters.new = 0;
        filters.ready_to_pay = 0;
        filters.completed = 0;
        filters.canceled = 0;

        let list_client_ids = [];
        for(var i = 0; i < orders.length ; i++){
            list_client_ids.push(orders[i].client_id);

            // check filter numbers 
            switch (orders[i].status) {
                case 'new':
                    filters.new++;
                    break;
                case 'completed':
                    filters.completed++;
                    break;
                case 'ready-to-pay':
                    filters.ready_to_pay++;
                    break;
                case 'canceled':
                    filters.canceled++;
                    break;
                default:
                    filters.all = orders.length;
                    break;
            }
        }
        console.log(filters);

        const clients_data = await db.query('SELECT * FROM client WHERE id IN(?)', [list_client_ids]);

        for(var i = 0; i < orders.length ; i++) {
            
            for (var j = 0; j < clients_data.length; j++) {
                if (orders[i].client_id == clients_data[j].id){
                    orders[i].client_name = clients_data[j].first_name;

                    orders[i].fecha_de_pedido = timeAgo.format(orders[i].fecha_de_pedido, "es");

                    switch (orders[i].status ) {
                        case 'new':
                            orders[i].new = true;
                            break;
                        case 'completed':
                            orders[i].completed = true;
                            break;
                        case 'ready-to-pay':
                            orders[i].ready_to_pay = true;
                            break;
                        case 'canceled':
                            orders[i].canceled = true;
                            break;
                        default:
                            orders[i].new = true;
                            break;
                    }
                    // console.log("match")
                }
            }            
        }

        // console.log(orders);
        return res.render('./admin/products/orders.hbs', {
            message: message,
            alertType: alertType,
            orders: orders,
            filters: filters,
            pagination_bar: pag_bar,
        });

    });

}

exports.filter_orders = async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    const data = req.params.data;
    console.log("data: ", data);

    // filter's bar numbers

    const filter_data_orders = await db.query("SELECT * FROM pedido ORDER BY id DESC");

    let filters = {};
    // image.png
    filters.all = filter_data_orders.length;
    filters.new = 0;
    filters.ready_to_pay = 0;
    filters.completed = 0;
    filters.canceled = 0;

    for (var i = 0; i < filter_data_orders.length; i++) {
        // check filter numbers 
        switch (filter_data_orders[i].status) {
            case 'new':
                filters.new++;
                break;
            case 'completed':
                filters.completed++;
                break;
            case 'ready-to-pay':
                filters.ready_to_pay++;
                break;
            case 'canceled':
                filters.canceled++;
                break;
            default:
                filters.all = filter_data_orders.length;
                break;
        }
    }
    console.log(filters);

    if(data == 'all'){
        return res.redirect('/admin/orders/');
    }
    else if(data == "undefined") {
        const orders = 0;
        console.log("no data in orders so error");
        return res.render('./admin/products/orders.hbs', {
            message: message,
            alertType: alertType,
            orders: orders,
            filters: filters,
            // pagination_bar: pag_bar,
        });
    }
    // pagination

    // console.log("deffff");
    // data query request await db.query(`SELECT * FROM pedido WHERE status = ${data} ORDER BY id DESC`);
    const pagination_format = await pagination(`SELECT * FROM pedido WHERE status = '${data}' ORDER BY id DESC`, req, res);
    const link_page = res.originalUrl;

    // if try to ingress to a different page range
    if (pagination_format.status == "return if over pages") {
        return res.redirect(link_page + '?page=' + encodeURIComponent(pagination_format.numberOfPages));
    }
    else if (pagination_format.status == "return if lower pages") {
        return res.redirect(link_page + '?page=' + encodeURIComponent(1))
    }
    else if (pagination_format.status == "no results") {
        req.flash('message', 'no se encontro ningún producto');
        req.flash('alertType', 'alert-danger');
        return res.redirect(link_page);
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
    pag_bar.link = link_page;
    console.log(pag_bar);

    // end pagination

    const orders = pagination_format.result; 
        
    // get order's clients
    
    let list_client_ids = [];
    
    for (var i = 0; i < orders.length; i++) {
        list_client_ids.push(orders[i].client_id);
    }
    
    console.log("c_ids :", list_client_ids)
    if(list_client_ids.length > 0) {
        
        const clients_data = await db.query('SELECT * FROM client WHERE id IN(?)', [list_client_ids]);
    
        for (var i = 0; i < orders.length; i++) {
    
            for (var j = 0; j < clients_data.length; j++) {
                if (orders[i].client_id == clients_data[j].id) {
                    orders[i].client_name = clients_data[j].first_name;
    
                    orders[i].fecha_de_pedido = timeAgo.format(orders[i].fecha_de_pedido, "es");
    
                    switch (orders[i].status) {
                        case 'new':
                            orders[i].new = true;
                            break;
                        case 'completed':
                            orders[i].completed = true;
                            break;
                        case 'ready-to-pay':
                            orders[i].ready_to_pay = true;
                            break;
                        case 'canceled':
                            orders[i].canceled = true;
                            break;
                        default:
                            orders[i].new = true;
                            break;
                    }
                    // console.log("match")
                }
            }
        }
    }
    
    return res.render('./admin/products/orders.hbs', {
        message: message,
        alertType: alertType,
        orders: orders,
        filters: filters,
        pagination_bar: pag_bar,
    });
}

exports.order_details = async (req, res) => {
    const { id } = req.params;
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    // console.log(message);


    await db.query("SELECT * FROM pedido WHERE id = ?", [id], async (error, result) => {
        if (error)
            console.log(error);

        const order = result[0];
        const client_details = await db.query("SELECT * FROM client WHERE id = ?", [order.client_id]);
        const order_details = await db.query("SELECT * FROM detalle_pedido WHERE pedido_id = ?", [order.id]);
        let list_product_ids = [];
        for(var i = 0; i<order_details.length ;i++) {
            list_product_ids.push(order_details[i].producto_id);
        }

        const ordered_products = await db.query("SELECT * FROM producto WHERE id IN (?);", [list_product_ids]);
        for (var i = 0; i < ordered_products.length; i++) {
            ordered_products[i].total = ordered_products[i].price * order_details[i].cantidad;
            ordered_products[i].quantity = order_details[i].cantidad;
        }
        // console.log(client_details);
        // console.log(order_details);
        // console.log(ordered_products);
        // console.log(order);
   

        order.fecha_de_pedido = timeAgo.format(order.fecha_de_pedido, "es");
        order.n_products = order_details.length;

        switch (order.status) {
            case 'new':
                order.new = true;
                break;
            case 'completed':
                order.completed = true;
                break;
            case 'ready-to-pay':
                order.ready_to_pay = true;
                break;
            case 'canceled':
                order.canceled = true;
                break;
            default:
                order.new = true;
                break;
        }

        // use the micro version to display the images

        for (var i = 0; i < ordered_products.length; i++) {
            ordered_products[i].img_dir = micro_img_dir(ordered_products[i].img_dir);
        }

        // console.log(order);
        return res.render('./admin/products/order_details.hbs', {
            message: message,
            alertType: alertType,
            order: order,
            client: client_details[0],
            ordered_products: ordered_products,
            order_details: order_details,
        });

    });

}

exports.order_status = async (req, res) => {
    const updated_status = req.body.status;
    const id = req.params.id;
    console.log(req.body);
    console.log(id);

    const client_id = (await db.query('SELECT client_id FROM pedido WHERE id = ?', [id]))[0].client_id;

    
    if(updated_status == 'completed' || updated_status == 'canceled'){
        console.log(updated_status, client_id);
        await db.query("DELETE FROM cart_shopping WHERE client_id = ?", [client_id]);
    }

    await db.query("UPDATE pedido SET ? WHERE id = ?", [{ status: updated_status}, id ]);

    return res.redirect('/admin/orders/details/' + id);
}