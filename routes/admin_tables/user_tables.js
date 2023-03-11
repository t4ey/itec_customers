const { db } = require('../../database/database.js');

exports.admins = async (req, res) => {
    const message = req.flash('message');
    const alertType = req.flash('alertType');
    // const {alertType} = req.flash('alertType');

    // console.log(message);

    await db.query("SELECT * FROM administradores", async (error, result) => {
        if (error)
            console.log(error);

        employees = result;
        if (result) {
            // console.log(result);
            return res.render('./admin/clientsNcustomers/salesperson', {
                employees: employees,
                message: message,
                alertType: alertType,
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

        clients = result;
        if (result) {
            // console.log(result);
            return res.render('./admin/clientsNcustomers/clients', {
                clients: clients,
                message: message,
                alertType: alertType,
            });
        }
        else
            console.log("nop");

    });

}