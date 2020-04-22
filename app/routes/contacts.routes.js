const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const contact = require('../controllers/contacts.controller.js');
    app.post('/contacts/save-contact',auth, contact.saveContact);
    app.get('/contacts/get-contact',auth, contact.getContact);
};
