const jwt = require('jsonwebtoken');
const secretKey = require('../config/keys').secret;
const User = require('../models/User');


// Middleware function to protect the routes.
const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token, secretKey, (err, decodedToken) => {
            if(err){
                // console.log(err);
                res.redirect('/login');
            }else{
                // console.log(decodedToken);
                next();
            }
        });
    }else{
        res.redirect('/login');
    }
}

// Check the current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token, secretKey, async (err, decodedToken) => {
            if(err){
                // console.log(err);
                res.locals.user = null;
                next();
            }else{
                // console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    }else{
        res.locals.user = null;
        next();
    }
}

module.exports = {requireAuth, checkUser};  