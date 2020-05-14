const mongoose = require('mongoose');

const PaymentSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    transactionId: String,
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter'},
    amount: String,
    paidStatus: String,
    paidOn: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Payment', PaymentSchema, 'Payments');