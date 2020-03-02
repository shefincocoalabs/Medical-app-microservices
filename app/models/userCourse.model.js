const mongoose = require('mongoose');

const UserCourseSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter'},
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('UserCourse', UserCourseSchema, 'UserCourses');