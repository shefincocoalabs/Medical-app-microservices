const mongoose = require('mongoose');


const OtpSchema = mongoose.Schema({
    countryCode : String,
    phone : String, 
    isUsed : Boolean,
    userToken : String,
    apiToken : String,
    smsResponse : String,
    expiry : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('Otp', OtpSchema, 'Otps');