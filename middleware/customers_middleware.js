const jwt = require('jsonwebtoken');
const jwt_secret = "secretPassword";

const { db } = require('../database/database.js');

const  requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;

    // check if json web token exist
    if(token) {
        jwt.verify(token, jwt_secret, (error, decodedToken) => {
            if(error){
                console.log(error.message);
                res.redirect('/login');
                // res.redirect('/login');                
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
}

const checkUser = async (req, res, next) => {

    const token = req.cookies.jwt;

    // check if json web token exist
    if (token) {
        jwt.verify(token, jwt_secret, async (error, decodedToken) => {
            if (error) {
                console.log(error.message);
                res.locals.user = null;
                // res.redirect('/login');                
            } else {
                console.log(decodedToken);
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
        // console.log(await db.query("SELECT * FROM client WHERE id = 4"));
        next();
        // res.redirect('/login');
    }
};

module.exports = {requireAuth, checkUser};