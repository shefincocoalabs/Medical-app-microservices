const mongoose = require('mongoose');

const BookmarkSchema = mongoose.Schema({
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Boomark', BookmarkSchema, 'Bookmarks');