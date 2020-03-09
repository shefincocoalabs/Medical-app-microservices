module.exports = (app,methods,options) => {
    const contact = methods.loadController('contacts',options);
    contact.methods.post('/save-contact',contact.saveContact, {auth:true});
    contact.methods.get('/get-contact',contact.getContact, {auth:true});
    
}