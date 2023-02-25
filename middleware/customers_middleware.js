const jwt = require('jsonwebtoken');
const jwt_secret = "secretPassword";

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

module.exports = {requireAuth};