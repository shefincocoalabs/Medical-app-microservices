const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userType: { type: mongoose.Schema.Types.ObjectId, ref: 'UserType'},
    firstName: String,
    username: String,
    email: String,
    image: String,
    phone: String,
    middleName: String,
    lastName: String,
    college: String,
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College'},
    acceptTerms: Boolean,
    deviceToken: String,
    purchasedChapterIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'Subject'}],
    is_blocked: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('User', UserSchema, 'Users');