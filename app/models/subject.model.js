const mongoose = require('mongoose');

const SubjectSchema = mongoose.Schema({
    name: String,
    description: String,
    curriculumTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'CurriculumType'},
    image: String,
    gradientStartColorHex: String,
    gradientEndColorHex: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Subject', SubjectSchema, 'Subjects');