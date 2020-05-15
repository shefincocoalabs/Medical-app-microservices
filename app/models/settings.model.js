const mongoose = require('mongoose');

const SettingsSchema = mongoose.Schema({
    phone: String,
    email: String,
    apiKey: String,
    address: String,

});
module.exports = mongoose.model('Settings', SettingsSchema, 'Settings');