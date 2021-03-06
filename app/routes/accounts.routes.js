const auth = require('../middleware/auth.js');
var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var profilePath = config.profile;
const path = require('path');

var storage = multer.diskStorage({
    destination: profilePath.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var userImageUpload = multer({ storage: storage });
module.exports = (app) => {
    const accounts = require('../controllers/accounts.controller.js');
    app.post('/accounts/sign-up', accounts.register);
    app.post('/accounts/send-otp', accounts.otpLogin);
    app.post('/accounts/validate-otp', accounts.validateOtp);
    app.get('/accounts/get-profile',auth, accounts.getProfile);
    app.patch('/accounts/update-profile',auth, userImageUpload.single('image'), accounts.updateProfile);
    app.get('/accounts/wish-list',auth, accounts.getWishList);
    app.get('/accounts/my-courses',auth, accounts.myCourses);
    app.get('/accounts/common-details',auth, accounts.getCommonDetails);
    app.get('/accounts/colleges', accounts.getColleges);
    
};
