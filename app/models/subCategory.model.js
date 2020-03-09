const mongoose = require('mongoose');

const SubCategorySchema = mongoose.Schema({
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter'}, 
    name: String,
    status: Number,
    sortOrder: Number,
    userIdCreator : Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('SubCategory', SubCategorySchema, 'SubCategories');