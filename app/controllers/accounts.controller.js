function sendOtp() {
  var otp = Math.floor(1000 + Math.random() * 9000);
  return otp
}

function accountsController(methods, options) {
  var User = require('../models/user.model.js');
  var Otp = require('../models/otp.model.js');
  var Bookmark = require('../models/bookmark.model.js');
  var Video = require('../models/videos.model.js');
  var Chapter = require('../models/chapter.model.js');
  var config = require('../../config/app.config.js');
  var wishlistConfig = config.wishList;
  var videosConfig = config.videos;
  var profileConfig = config.profile;
  const paramsConfig = require('../../config/params.config');
  const JWT_KEY = paramsConfig.development.jwt.secret;
  var otpConfig = config.otp;
  var moment = require('moment');
  const uuidv4 = require('uuid/v4');
  var jwt = require('jsonwebtoken');

  // ** API for signup and send OTP **
  this.register = async(req, res) => {
    var firstName = req.body.firstName;
    var email = req.body.email;
    var phone = req.body.phone;
    var collegeId = req.body.collegeId;
    var acceptTerms = req.body.acceptTerms;
    var otp = Math.floor(1000 + Math.random() * 9000);
    const apiToken = uuidv4();
    if (!firstName || !email || !phone || !acceptTerms) {
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
      if (!acceptTerms) {
        errors.push({
          field: "terms and conditions",
          message: "Terms and conditions cannot be empty"
        });
      }
      return res.send({
        success: 0,
        errors: errors,
      });
    }

    var expiry = Date.now() + (otpConfig.expirySeconds * 1000);

    var findCriteria = {
      phone: phone
    }
    let result = await User.findOne(findCriteria)
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
        // collegeId: collegeId,
        acceptTerms: acceptTerms,
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
        }).catch(err => {
          res.status(200).send({
            success: 0,
            errors: err,
            code: 200
          });
        });
  }

  // *** Send OTP ***
  this.otpLogin = (req, res) => {
    var expiry = Date.now() + (otpConfig.expirySeconds * 1000);
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
        expiry: parseInt(expiry)
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
  this.validateOtp = async (req, res) => {
    var params = req.body;
    var otp = params.otp;
    var phone = params.phone;
    var apiToken = params.apiToken;
    var deviceToken = params.deviceToken;
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
    var otpData = await Otp.findOne(findCriteria);

    if (otpData) {
    let currentTime = Date.now();

    var otpData1 = await Otp.findOne({
      userToken: otp,
      apiToken: apiToken,
      isUsed: false,
      expiry : {
        $gt: currentTime
      }
    });
      if (otpData1 === null) {
        return res.send({
          success: 0,
          message: 'otp expired,please resend otp to get a new one'
        })
      } else {
        var result = await User.findOne({
          phone: phone
        })
        userId = result._id;
        var payload = {
          id: result._id,
          firstName: result.firstName,
          email: result.email,
          phone: result.phone,
          image: '',
          deviceToken: deviceToken
        }
        var token = jwt.sign({
          data: payload,
          // exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS
        }, JWT_KEY, {
          expiresIn: '30 days'
        });
        var filter = {
          userToken: otp,
          apiToken: apiToken
        }
        var update = {
          isUsed: true
        }
        Otp.findOneAndUpdate(filter, update, {
          new: true,
          useFindAndModify: false
        }).then(result => {
          User.findOneAndUpdate({
            _id: userId
          }, {
            deviceToken: deviceToken
          }, {
            new: true,
            useFindAndModify: false
          }).then(result => {
            return res.send({
              success: 1,
              message: 'Otp verified successfully',
              imageBase: profileConfig.imageBase,
              userDetails: payload,
              token: token
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
        imageBase: profileConfig.imageBase,
        userDetails: result
      })

    })
  };

  // *** API for update profile ***
  this.updateProfile = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var params = req.body;
    var profileImage = req.file;
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
      new: true,
      useFindAndModify: false
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
      match: {
        status: 1
      },
      select: 'title video length description averageRating thumbnail status'
    }).limit(perPage).then(result => {
      Bookmark.countDocuments(findCriteria, function (err, itemsCount) {
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          success: 1,
          message: 'Wish list listed successfully',
          imageBase: videosConfig.thumbnailImageBase,
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

  };
  // *** API for listing purchaced chapters under my courses ***
  this.myCourses = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var findCriteria = {
      _id: userId,
      status: 1
    };
    var purchasedChapterIds;
    var purchasedChapterId;
    let response;
    let items = [];
    let userDetails = await User.findOne(findCriteria);
    purchasedChapterIds = userDetails.purchasedChapterIds;
    if(purchasedChapterIds.length == 0) {
      return res.send({
        success: 0,
        message: 'User is not purchased any chapter'
      })
    }
    await Promise.all(purchasedChapterIds.map(async (item) => {
      purchasedChapterId = item;
      let result = await Chapter.findOne({
        _id: purchasedChapterId,
        status: 1
      });
      let videosCount = await Video.countDocuments({
        chapterId: purchasedChapterId,
        status: 1
      })
      response = {
        id: result._id,
        title: result.title,
        videosCount: videosCount
      };
      items.push(response)
    }));
    res.send({
      success: 1,
      message: 'My courses listed successfully',
      items: items
    })
  };

  this.uploadProfileImage = (req,res) => {
    console.log('hihihi')
    console.log(req.files);
    var files = req.files;
    console.log(files)
    if (req.files.images) {
      console.log("Image field detected");
      type = "image";
      var len = files.images.length;
      var i = 0;
      while (i < len) {
        images.push(files.images[i].filename);
        i++;
      }
      console.log("images is " + images);
    }
  }
}
module.exports = accountsController
