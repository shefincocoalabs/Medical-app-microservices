const mongoose = require('mongoose');

const PageSchema = mongoose.Schema({
    title: String,
    seoTitle: String,
    description: String,
    image: String,
    email: String,   
    phone: String,
    address: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Page', PageSchema, 'Pages');