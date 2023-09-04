const jwt = require('jsonwebtoken');
const jwt_secret = "secretPassword";

const { db } = require('../database/database.js');

const  requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;

    // check if json web token exist
    if(token) {
        jwt.verify(token, jwt_secret, (error, decodedToken) => {
            if(error){
                console.log("error auth cl", error.message);
                res.redirect('/login');
                // res.redirect('/login');                
            } else {
                // console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
}

const checkUser = async (req, res, next) => {

    const token = req.cookies.jwt;
    // check if checkuser is checking an admin page 
    if(req.originalUrl.toLowerCase().includes("admin")){
        // console.log("admin redirect");
        return next();
    }
    // check if json web token exist
    if (token) {
        jwt.verify(token, jwt_secret, async (error, decodedToken) => {
            if (error) {
                console.log("error cl auth", error.message);
                res.locals.user = null;
                next();
                // res.redirect('/login');                
            } else {
                console.log("check user md: ",decodedToken);
                userId = decodedToken.id;
                // console.log(userId);

                let user = await db.query("SELECT * FROM client WHERE id = ?", [userId]);
                res.locals.user = user[0];
                // console.log(res.locals.user.email);

                next();
            }
        });
    } else {
        res.locals.user = null;
        console.log("user checked", req.originalUrl);
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
                console.log("error cl auth", error.message);
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

module.exports = { requireAuth, checkUser, alreadyLogged };