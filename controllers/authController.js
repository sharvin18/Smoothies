const User = require('../models/User');
const jwt = require('jsonwebtoken');
const secretKey = require('../config/keys').secret;


// Handling errors
const handleErrors = (err) => {
    
    // console.log(err.message, err.code);
    // Maintain errors array
    let errors = {email: '', password: ''};

    // Validation for an existing email
    if(err.code === 11000){                          
        errors.email = 'The email already exists';
        return errors;
    }

    // Login authentication errors
    if(err.message === "Incorrect email"){
        errors.email = "Email is not registered";
    }

    if(err.message === "Incorrect password"){
        errors.password = "Incorrect password";
    }

    // Getting corresponding error message
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({ properties }) => {
            console.log(properties);
            errors[properties.path] = properties.message;   // Adding the error into our errors list
        });
    }

    return errors;
}

signup_get = (req, res) => {
    res.render('signup');
}

login_get = (req, res) => {
    res.render('login');
}

logout_get = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}

signup_post = async (req, res) => {
    const { email, password } = req.body;

    try{
        const newUser = await User.create({ email, password });
        const token = createToken(newUser._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        return res.status(201).json({ newUser: newUser._id });

    }catch(err){
        const errors = handleErrors(err);
        return res.status(400).json({ errors });
    }
}


login_post = async (req, res) => {
    const { email, password } = req.body;

    try{
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge*1000 });
        return res.status(200).json({ user: user._id });

    }catch(err){
        const errors = handleErrors(err);
        return res.status(400).json({ errors });
    }
}

const maxAge = 1 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, secretKey, {
        expiresIn: maxAge
    });
}

module.exports = { signup_get, signup_post, login_get, login_post, logout_get }