const mongoose = require('mongoose');

const UserTypeSchema = mongoose.Schema({
    name: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('UserType', UserTypeSchema, 'UserTypes');