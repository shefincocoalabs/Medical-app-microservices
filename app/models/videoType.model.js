const mongoose = require('mongoose');

const VideoTypeSchema = mongoose.Schema({
    name: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userIdCreator: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('VideoType', VideoTypeSchema, 'VideoTypes');