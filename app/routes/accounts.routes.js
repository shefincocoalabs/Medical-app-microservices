module.exports = (app,methods,options) => {
    const accounts = methods.loadController('accounts',options);
    accounts.methods.post('/sign-up',accounts.register, {auth:false});
    accounts.methods.post('/validate-otp',accounts.validateOtp, {auth:false});
    accounts.methods.get('/get-profile',accounts.getProfile, {auth:true});
    accounts.methods.patch('/update-profile',accounts.updateProfile, {auth:true});
    accounts.methods.get('/wish-list',accounts.getWishList, {auth:true});
}