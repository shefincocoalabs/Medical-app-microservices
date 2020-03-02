const mongoose = require('mongoose');

const VideoSchema = mongoose.Schema({
    title: String,
    videoTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoType' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    noteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note'}],
    video: String,
    length: String,
    description: String,
    isFree: String,
    averageRating: String,
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    userIdCreator: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Video', VideoSchema, 'Videos');