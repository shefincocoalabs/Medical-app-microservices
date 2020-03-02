const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userType: { type: mongoose.Schema.Types.ObjectId, ref: 'UserType'},
    firstName: String,
    username: String,
    email: String,
    image: String,
    phone: String,
    middleName: String,
    lastName: String,
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College'},
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('User', UserSchema, 'Users');