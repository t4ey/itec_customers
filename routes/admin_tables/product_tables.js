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