const { db } = require('../../database/database.js');

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

// EXPORTS

exports.admins = async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');
    // const {alertType} = req.flash('alertType');

    // console.log(message);

    await db.query("SELECT * FROM administradores", async (error, result) => {
        if (error)
            console.log(error);

        // pagination

        // console.log("deffff");
        // data query request await db.query(`SELECT * FROM pedido WHERE status = ${data} ORDER BY id DESC`);
        const pagination_format = await pagination('SELECT * FROM administradores', req, res);
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

        employees = pagination_format.result;
        if (result) {
            // console.log(result);
            return res.render('./admin/clientsNcustomers/salesperson', {
                employees: employees,
                message: message,
                alertType: alertType,
                pagination_bar: pag_bar,
            });
        }
        else 
            console.log("nop");
            
    });
        
}

exports.clients = async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');

    // console.log(message);

    await db.query("SELECT * FROM client", async (error, result) => {
        if (error)
            console.log(error);

        // pagination

        // console.log("deffff");
        // data query request await db.query(`SELECT * FROM pedido WHERE status = ${data} ORDER BY id DESC`);
        const pagination_format = await pagination('SELECT * FROM client', req, res);
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

        clients = pagination_format.result;
        if (result) {
            // console.log(result);
            return res.render('./admin/clientsNcustomers/clients', {
                clients: clients,
                message: message,
                alertType: alertType,
                pagination_bar: pag_bar,
            });
        }
        else
            console.log("nop");

    });

}