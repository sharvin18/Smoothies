const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new Schema({

    email: {
        type: String,
        required: [true, 'Please enter an email'],   // Using mongoose validations.
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Invalid email']
    },

    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Please enter 6 or more characters'],
    }

});

// Fire the function after the doc has been saved to database
// userSchema.post('save', function (doc, next) {
//     console.log("User saved", doc);
//     next();
// });

// Fire the function before the doc is saved to the db
// Use a normal function instead of arrow fn so as to use 
// the current doc instance with the keyword "this"
userSchema.pre('save', async function (next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Static method to login a user

userSchema.statics.login = async function(email, password) {

    const user = await this.findOne({ email });

    if(user){
        const auth = await bcrypt.compare(password, user.password);
        
        if(auth){
            return user;
        }else{
            throw new Error('Incorrect password');
        }
    }

    throw new Error('Incorrect email');
}

const User = mongoose.model('user', userSchema);

module.exports = User;