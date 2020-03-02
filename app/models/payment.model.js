const mongoose = require('mongoose');

const PaymentSchema = mongoose.Schema({
    userId: String,
    transactionId: String,
    amount: String,
    paidStatus: String,
    paidOn: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Payment', PaymentSchema, 'Payments');