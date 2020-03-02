const mongoose = require('mongoose');

const ContactSchema = mongoose.Schema({
    name: String,
    email: String,
    message: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Contact', ContactSchema, 'Contacts');