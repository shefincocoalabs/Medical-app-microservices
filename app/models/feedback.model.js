const mongoose = require('mongoose');

const FeedbackSchema = mongoose.Schema({
    name: String,
    email: String,
    message : String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Feedback', FeedbackSchema, 'Feedbacks');