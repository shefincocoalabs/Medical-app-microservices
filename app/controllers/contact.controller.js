function contactController(methods, options) {
  var Contact = require('../models/contact.model.js');
  var moment = require('moment');
  // *** API for submitting contact us ***
  this.saveContact = (req, res) => {
    var params = req.body;
    var name = params.name;
    var email = params.email;
    var message = params.message;
    // if (!name || !email || message) {
    //   var errors = [];
    //   if (!name) {
    //     errors.push({
    //       field: "name",
    //       message: "Name cannot be empty"
    //     });
    //   }
    //   if (!email) {
    //     errors.push({
    //       field: "email",
    //       message: "Email cannot be empty"
    //     });
    //   }
    //   if (!message) {
    //     errors.push({
    //       field: "message",
    //       message: "Message cannot be empty"
    //     });
    //   }
    //   return res.send({
    //     success: 0,
    //     errors: errors,
    //   });
    // }
    const newContact = new Contact({
      name: name,
      email: email,
      message: message,
      status: 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    });
    newContact.save()
      .then(data => {
        var formattedData = {
          success: 1,
          message: "Contact submitted"
        };
        res.send(formattedData);
      }).catch(err => {
        res.status(500).send({
          success: 0,
          status: 500,
          message: err.message || "Some error occurred while submitting contact."
        });
      });
  }
}
module.exports = contactController
