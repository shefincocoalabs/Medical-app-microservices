const mongoose = require('mongoose');

const ChapterSchema = mongoose.Schema({
    title: String,
    subtitle: String, 
    price: String,
    description: String,
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    authorIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'Author'}],
    image: String,
    bannerImage: String,
    gradientStartColorHex: String,
    gradientEndColorHex: String,
    userIdCreator: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Chapter', ChapterSchema, 'Chapters');