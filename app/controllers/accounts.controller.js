function sendOtp() {
  var otp = Math.floor(1000 + Math.random() * 9000);
  return otp
}

function accountsController(methods, options) {
  var User = require('../models/user.model.js');
  var Otp = require('../models/otp.model.js');
  var Bookmark = require('../models/bookmark.model.js');
  var Video = require('../models/videos.model.js');
  var config = require('../../config/app.config.js');
  var wishlistConfig = config.wishList;
  const paramsConfig = require('../../config/params.config');
  const JWT_KEY = paramsConfig.development.jwt.secret;
  var otpConfig = config.otp;
  var expiry = Date.now() + (otpConfig.expirySeconds * 1000);
  var moment = require('moment');
  const uuidv4 = require('uuid/v4');
  var jwt = require('jsonwebtoken');

  // ** API for signup and send OTP **
  this.register = (req, res) => {
    var firstName = req.body.firstName;
    var email = req.body.email;
    var phone = req.body.phone;
    var collegeId = req.body.collegeId;
    var otp = Math.floor(1000 + Math.random() * 9000);
    const apiToken = uuidv4();
    if (!firstName || !email || !phone) {
      var errors = [];
      if (!firstName) {
        errors.push({
          field: "firstName",
          message: "First Name cannot be empty"
        });
      }
      if (!email) {
        errors.push({
          field: "email",
          message: "Email cannot be empty"
        });
      }
      if (!phone) {
        errors.push({
          field: "phone",
          message: "Phone cannot be empty"
        });
      }
      return res.send({
        success: 0,
        errors: errors,
      });
    }



    var findCriteria = {
      phone: phone
    }
    User.findOne(findCriteria).then(result => {
      if (result) {
        return res.send({
          success: 0,
          message: 'Phone number is already registered. Try with a different one'
        })
      }
      const newRegistration = new User({
        firstName: firstName,
        email: email,
        phone: phone,
        collegeId: collegeId,
        deviceToken: '',
        status: 1,
        tsCreatedAt: Number(moment().unix()),
        tsModifiedAt: null
      });
      newRegistration.save()
        .then(data => {
          const newOtp = new Otp({
            phone: phone,
            isUsed: false,
            userToken: otp,
            apiToken: apiToken,
            expiry: expiry
          });
          newOtp.save()
            .then(data => {
              var otpGenerateResponse = {
                phone: data.phone,
                userToken: data.userToken,
                apiToken: data.apiToken,
                isRegistered: 1
              }
              res.send({
                success: 1,
                message: 'New user is registered successfully and otp is sent to your registered number for verification',
                otpGenerateResponse: otpGenerateResponse
              });
            }).catch(err => {
              res.status(200).send({
                success: 0,
                errors: [{
                  field: "phone",
                  message: err.message || "Some error occurred while generating otp"
                }],
                code: 200
              });
            });
        })
    })
  }

  // *** Send OTP ***
  this.otpLogin = (req, res) => {
    var params = req.body;
    var phone = params.phone;
    const apiToken = uuidv4();
    if (!phone) {
      return res.send({
        success: 0,
        message: 'Phone cannot be empty'
      })
    }
    var findCriteria = {
      phone: phone
    }
    User.findOne(findCriteria).then(result => {
      if (!result) {
        return res.send({
          success: 0,
          message: 'Phone number is not registered'
        })
      }
      const newOtp = new Otp({
        phone: phone,
        isUsed: false,
        userToken: sendOtp(),
        apiToken: apiToken,
        expiry: expiry
      });

      newOtp.save()
        .then(data => {
          var otpGenerateResponse = {
            phone: data.phone,
            userToken: data.userToken,
            apiToken: data.apiToken,
            isRegistered: 1
          }
          res.send({
            success: 1,
            message: 'otp generated and sent to the registered number',
            otpGenerateResponse: otpGenerateResponse
          });
        }).catch(err => {
          res.status(200).send({
            success: 0,
            errors: [{
              field: "phone",
              message: err.message || "Some error occurred while generating otp"
            }],
            code: 200
          });
        });
    })
  }

  // *** API for validating OTP ***
  this.validateOtp = (req, res) => {
    var params = req.body;
    var otp = params.otp;
    var phone = params.phone;
    var apiToken = params.apiToken;
    var deviceToken = params.deviceToken;
    var currentTime = Date.now();
    var userId;
    if (!phone || !otp || !apiToken || !deviceToken) {
      var errors = [];
      if (!phone) {
        errors.push({
          field: "phone",
          message: "phone is missing"
        });
      }
      if (!otp) {
        errors.push({
          field: "otp",
          message: "otp is missing"
        });
      }
      if (!apiToken) {
        errors.push({
          field: "apiToken",
          message: "api Token is missing"
        });
      }
      if (!deviceToken) {
        errors.push({
          field: "deviceToken",
          message: "device Token is missing"
        });
      }
      return res.status(200).send({
        success: 0,
        errors: errors,
        code: 200
      });
    }
    var findCriteria = {
      userToken: otp,
      apiToken: apiToken,
      isUsed: false
    }
    Otp.findOne(findCriteria).then(result => {
      console.log(result);
      if (result) {
        if (parseInt(currentTime) > parseInt(result.expiry)) {
          return res.send({
            success: 0,
            message: 'otp expired,please resend otp to get a new one'
          })
        } else {
          User.findOne({
            phone: phone
          }).then(result => {
            userId = result._id;
            var payload = {
              id: result._id,
              firstName: result.firstName,
              email: result.email,
              phone: result.phone,
              deviceToken: deviceToken
            }
            var token = jwt.sign({
              data: payload,
              // exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS
            }, JWT_KEY, {
              expiresIn: '10h'
            });
            var filter = {
              userToken: otp,
              apiToken: apiToken
            }
            var update = {
              isUsed: true
            }
            Otp.findOneAndUpdate(filter, update, {
              new: true
            }).then(result => {
              User.findOneAndUpdate({
                _id: userId
              }, {
                deviceToken: deviceToken
              }, {
                new: true
              }).then(result => {
                return res.send({
                  success: 1,
                  message: 'Otp verified successfully',
                  userDetails: payload,
                  token: token
                })
              })

            })
          })
        }
      } else {
        return res.send({
          success: 0,
          message: 'Otp does not matching'
        })
      }
    })
  }
  // *** API for getting profile details ***
  this.getProfile = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var findCriteria = {
      _id: userId
    };
    var queryProjection = {
      _id: 1,
      firstName: 1,
      email: 1,
      phone: 1,
    };
    User.findOne(findCriteria, queryProjection).then(result => {
      if (!result) {
        return res.send({
          success: 0,
          message: 'User not found'
        })
      }
      res.send({
        success: 1,
        message: 'User details found',
        userDetails: result
      })

    })
  };

  // *** API for update profile ***
  this.updateProfile = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var params = req.body;
    if (!params.firstName && !params.email && !params.phone) {
      return res.send({
        success: 0,
        message: 'Nothing to update'
      })
    }
    var update = {};
    if (params.firstName) {
      update.firstName = params.firstName
    };
    if (params.email) {
      update.email = params.email
    };
    if (params.phone) {
      update.phone = params.phone
    };
    var filter = {
      _id: userId
    };
    User.findOneAndUpdate(filter, update, {
      new: true
    }).then(result => {
      res.send({
        success: 1,
        message: 'User data updated successfully'
      })
    }).catch(err => {
      return res.send({
        success: 0,
        message: 'Something went wrong while updating user data',
        error: err
      })
    });
  };

  // *** API for getting wish list for the user ***
  this.getWishList = (req, res) => {
    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || wishlistConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : wishlistConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
      skip: offset,
      limit: perPage
    };
    var userData = req.identity.data;
    var userId = userData.id;
    var findCriteria = {
      userId: userId,
      status: 1
    };
    var queryProjection = {
      _id: 1,
      videoId: 1,
    };
    Bookmark.find(findCriteria, queryProjection, pageParams).populate({
      path: 'videoId',
      Video,
      select: 'title video length description'
    }).limit(perPage).then(result => {
      Bookmark.countDocuments(findCriteria, function (err, itemsCount) {
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          success: 1,
          message: 'Wish list listed successfully',
          items: result,
          page: page,
          perPage: perPage,
          hasNextPage: hasNextPage,
          totalItems: itemsCount,
          totalPages: totalPages
        }
        res.send(responseObj);
      })
    })


  }
}
module.exports = accountsController
