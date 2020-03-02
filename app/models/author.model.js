const mongoose = require('mongoose');

const AuthorSchema = mongoose.Schema({
    name: String,
    image: String, 
    activeFromYear: String,
    activeToYear: String,
    biography: String,
    userIdCreator: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Author', AuthorSchema, 'Authors');