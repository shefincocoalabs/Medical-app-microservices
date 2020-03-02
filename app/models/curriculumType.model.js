const mongoose = require('mongoose');

const CurriculumTypeSchema = mongoose.Schema({
    name: String,
    image: String,
    gradientStartColorHex: String,
    gradientEndColorHex: String,
    userIdCreator: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('CurriculumType', CurriculumTypeSchema, 'CurriculumTypes');