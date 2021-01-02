const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'User must have name'],
        unique: [true, 'username must be unique']
    },
    password: {
        type: String,
        required: [true, 'User must have password']
    }
});

//schema.static(s) lets us define methods on the schema MODEL class.
//We are going to define a method that validates the user.
//We have that in the route handler, but for best practises, we should move the logic/code here
//and call it in the route handler.
userSchema.statics.findAndValidate = async function (username, password) {
    const foundUser = await this.findOne({ username: username });
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid ? foundUser : false;
    //is isvalid == true, return foundUser, else return flase
}

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    //we don't want to rehash the password if non-password user info is edited
    //so, if it isn't modified, don't hash it and just return next
    //this doesn't really apply to this demo app, but best practises never hurt.
    this.password = await bcrypt.hash(this.password, 12);
    //hashing the password, 12 rounds
    next();
    //because this is middleware, don't forget to call next();
})


module.exports = mongoose.model('User', userSchema);