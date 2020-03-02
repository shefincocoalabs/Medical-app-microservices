const mongoose = require('mongoose');

const CollegeSchema = mongoose.Schema({
    name: String,
    userIdCreator: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('College', CollegeSchema, 'Colleges');