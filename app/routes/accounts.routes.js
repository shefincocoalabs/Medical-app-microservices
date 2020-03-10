var multer = require('multer');
var config = require('../../config/app.config.js');
var feedsConfig = config.profile;
console.log(feedsConfig.imageUploadPath);
var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, feedsConfig.imageUploadPath);
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});
console.log(Storage)


var upload = multer({
    storage: Storage
});




module.exports = (app,methods,options) => {
    const accounts = methods.loadController('accounts',options);
    accounts.methods.post('/sign-up',accounts.register, {auth:false});
    accounts.methods.post('/send-otp',accounts.otpLogin, {auth:false});
    accounts.methods.post('/validate-otp',accounts.validateOtp, {auth:false});
    accounts.methods.get('/get-profile',accounts.getProfile, {auth:true});
    accounts.methods.patch('/update-profile',accounts.updateProfile, {auth:true});
    accounts.methods.get('/wish-list',accounts.getWishList, {auth:true});
    accounts.methods.get('/my-courses',accounts.myCourses, {auth:true});
    accounts.methods.post('/profile-upload',upload.fields([{ name: 'images', maxCount: feedsConfig.maxImageCount }]), accounts.uploadProfileImage);
}