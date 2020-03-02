const mongoose = require('mongoose');

const WishListSchema = mongoose.Schema({
    name: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('WishList', WishListSchema, 'WishLists');