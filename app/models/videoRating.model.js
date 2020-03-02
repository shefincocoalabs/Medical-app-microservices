const mongoose = require('mongoose');

const VideoRatingSchema = mongoose.Schema({
    name: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserType' },
    videoId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    rating: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('VideoRating', VideoRatingSchema, 'VideoRatings');