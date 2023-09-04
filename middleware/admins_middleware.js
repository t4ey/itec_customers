const jwt = require('jsonwebtoken');
const jwt_secret = "secretAdminPassword";

const { db } = require('../database/database.js');

const  requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;

    // check if json web token exist
    if(token) {
        jwt.verify(token, jwt_secret, (error, decodedToken) => {
            if(error){
                console.log("error auth: ", error.message);
                res.redirect('/login');
                // res.redirect('/login');                
            } else {
                // console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/admin/login');
    }
}

const checkAdmin = async (req, res, next) => {

    const token = req.cookies.jwt; 

    // check if json web token exist
    if (token) {
        jwt.verify(token, jwt_secret, async (error, decodedToken) => {
            if (error) {
                console.log("error auth : ", error.message);
                res.locals.admin = null;
                res.redirect('/');
                // res.redirect('/login');                
            } else {
                console.log("check admin md: ",decodedToken);
                let adminId = decodedToken.id;
                // console.log(userId);

                let admin = await db.query("SELECT * FROM administradores WHERE id = ?", [adminId]);
                res.locals.admin = admin[0];
                // console.log(res.locals.user.email);

                next();
            }
        });
    } else {
        res.locals.user = null;
        console.log("admin checked", req.originalUrl);
        // console.log(await db.query("SELECT * FROM client WHERE id = 4"));
        next();
        // res.redirect('/login');
    }
};

const alreadyLogged = async (req, res, next) => {

    const token = req.cookies.jwt;

    // check if json web token exist
    if (token) {
        jwt.verify(token, jwt_secret, async (error, decodedToken) => {
            if (error) {
                console.log("error auth", error.message);
                // res.redirect('/login');                
            } else {
                res.redirect('back'); 
            }
        });
    } else {
        next();
        // res.redirect('/login');
    }
};

module.exports = { requireAuth, checkAdmin, alreadyLogged };