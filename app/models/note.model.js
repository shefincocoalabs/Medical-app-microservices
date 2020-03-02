const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    name: String,
    file: String,
    userIdCreator: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Note', NoteSchema, 'Notes');