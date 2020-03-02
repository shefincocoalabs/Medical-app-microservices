module.exports = (app,methods,options) => {
    const contact = methods.loadController('contact',options);
    contact.methods.post('/save-contact',contact.saveContact, {auth:true});
    
}