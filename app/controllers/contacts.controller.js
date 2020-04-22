
  var Contact = require('../models/contact.model.js');
  var Pages = require('../models/page.model.js');
  var moment = require('moment');

  // *** API for submitting contact us ***
  exports.saveContact = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var params = req.body;
    var name = params.name;
    var email = params.email;
    var message = params.message;
    if (!name || !email || !message) {
      var errors = [];
      if (!name) {
        errors.push({
          field: "name",
          message: "Name cannot be empty"
        });
      }
      if (!email) {
        errors.push({
          field: "email",
          message: "Email cannot be empty"
        });
      }
      if (!message) {
        errors.push({
          field: "message",
          message: "Message cannot be empty"
        });
      }
      return res.send({
        success: 0,
        errors: errors,
      });
    }
    const newContact = new Contact({
      user: userId,
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
  };

  exports.getContact = (req, res) => {
    var queryProjection = {
      email: 1,
      phone: 1,
      address: 1,
      name: 1,
      status: 1
    };
    Pages.find({
      seoTitle: 'contact-us',
      status: 1
    }, queryProjection).then(result => {
      if (!result) {
        return res.send({
          success: 0,
          message: 'No results found'
        })
      }
      res.send({
        success: 1,
        items: result,
        message: 'contact-us fetched successfully'
      })
    })
  }

