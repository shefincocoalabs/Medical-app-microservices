const mongoose = require('mongoose');

const HelpAndFeedbackSchema = mongoose.Schema({
    title: String,
    description: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('HelpAndFeedback', HelpAndFeedbackSchema, 'HelpAndFeedbacks');