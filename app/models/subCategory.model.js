const mongoose = require('mongoose');

const SubCategorySchema = mongoose.Schema({
    chapterId: String,
    name: String,
    status: Number,
    userIdCreator : Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('SubCategory', SubCategorySchema, 'SubCategories');