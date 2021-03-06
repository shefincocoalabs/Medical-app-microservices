function sendOtp() {
  var otp = Math.floor(1000 + Math.random() * 9000);
  return otp
}
var User = require('../models/user.model.js');
var Otp = require('../models/otp.model.js');
var Bookmark = require('../models/bookmark.model.js');
var Video = require('../models/videos.model.js');
var Chapter = require('../models/chapter.model.js');
var Page = require('../models/page.model.js');
var College = require('../models/college.model');
var HelpsAndFeedBack = require('../models/helpAndFeedback.model.js');
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
exports.register = async (req, res) => {
  var firstName = req.body.firstName;
  var email = req.body.email;
  var phone = req.body.phone;
  var college = req.body.college;
  var acceptTerms = req.body.acceptTerms;
  var otp = Math.floor(1000 + Math.random() * 9000);
  const apiToken = uuidv4();
  if (!firstName || !email || !college || !phone || !acceptTerms) {
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
    if (!college) {
      errors.push({
        field: "college",
        message: "College cannot be empty"
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
    phone: phone,
    status: 1
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
    image: '',
    college,
    is_blocked: 0,
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
exports.otpLogin = (req, res) => {
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
    phone: phone,
    status: 1
  }
  User.findOne(findCriteria).then(result => {
    if (!result) {
      return res.send({
        success: 0,
        message: 'Please signup to continue'
      })
    };
    if (result.is_blocked) {
      if (result.is_blocked == 1) {
        return res.send({
          success: 0,
          message: 'This phone number is blocked by admin panel, Please contact them for more details'
        })
      }
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
exports.validateOtp = async (req, res) => {
  var params = req.body;
  var otp = params.otp;
  var phone = params.phone;
  var apiToken = params.apiToken;
  var deviceToken = params.deviceToken;
  var userId;
  if (!phone || !otp || !apiToken) {
    // if (!phone || !otp || !apiToken || !deviceToken) {
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
    // if (!deviceToken) {
    //   errors.push({
    //     field: "deviceToken",
    //     message: "device Token is missing"
    //   });
    // }
    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });
  }
  if(!deviceToken){
    deviceToken = "";
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
      expiry: {
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
      var image = result.image ? result.image : '';
      var payload = {
        id: result._id,
        firstName: result.firstName,
        email: result.email,
        phone: result.phone,
        image: image,
        deviceToken: deviceToken
      };
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
exports.getProfile = (req, res) => {
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
    image: 1
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
      message: 'User details fetched successfully',
      imageBase: profileConfig.imageBase,
      userDetails: result
    })

  })
};

// *** API for update profile ***
exports.updateProfile = (req, res) => {
  var userData = req.identity.data;
  var userId = userData.id;
  var params = req.body;
  var profileImage = req.file;
  if (!params.firstName && !params.email && !params.phone && !profileImage) {
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
  if (profileImage) {
    update.image = profileImage.filename
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
      imageBase: profileConfig.imageBase,
      image: result.image,
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
exports.getWishList = (req, res) => {
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
exports.myCourses = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.id;
  var findCriteria = {
    _id: userId,
    status: 1
  };
  var purchasedChapterIds;
  let response;
  let items = [];
  let watchHistory = null;
  let userDetails = await User.findOne(findCriteria);
  purchasedChapterIds = userDetails.purchasedChapterIds;
  console.log(purchasedChapterIds);
  if (purchasedChapterIds.length == 0) {
    return res.send({
      success: 0,
      message: 'User is not purchased any chapter'
    })
  }
  if(userDetails.watchHistory){
    watchHistory = userDetails.watchHistory;
  }
  for (var i = 0; i < purchasedChapterIds.length; i++) {
    let viewedVideosCount = 0;
    if(watchHistory !== null){
      let chapterIndex = watchHistory.findIndex(x => JSON.stringify(x.chapterId) == JSON.stringify(purchasedChapterIds[i]));
      if(chapterIndex > -1){
        viewedVideosCount = watchHistory[chapterIndex].watchedVideoIds.length;
      }
      }
    let result = await Chapter.findOne({
      _id: purchasedChapterIds[i],
      status: 1
    });
    let videosCount = await Video.countDocuments({
      chapterId: purchasedChapterIds[i],
      status: 1
    });
    response = {
      id: result._id,
      title: result.title,
      videosCount: videosCount,
      viewedVideosCount 
    };
    items.push(response);
  }
  res.send({
    success: 1,
    message: 'My courses listed successfully',
    items: items
  })
};

exports.getCommonDetails = async (req, res) => {
  var queryProjection = {
    title: 1,
    seoTitle: 1,
    description: 1,
    image: 1
  };
  var queryProjectionFeedBack = {
    title: 1,
    description: 1
  };
  try {
    let aboutTheApp = await Page.findOne({
      seoTitle: 'contact-us',
      status: 1
    }, queryProjection);
    let privacyPolicy = await Page.findOne({
      seoTitle: 'privacy-policy',
      status: 1
    }, queryProjection);
    let termsOfService = await Page.findOne({
      seoTitle: 'terms-of-service',
      status: 1
    }, queryProjection);
    let helpAndFeedback = await HelpsAndFeedBack.find({
      status: 1
    }, queryProjectionFeedBack);
    res.send({
      success: 1,
      aboutTheApp: aboutTheApp,
      privacyPolicy: privacyPolicy,
      termsOfService: termsOfService,
      helpAndFeedback: helpAndFeedback,
      message: 'data listed successfully'
    })
  } catch (err) {
    res.send({
      success: 0,
      statusCode: 500,
      message: err.message
    });
  }
}

this.getColleges = async (req, res) => {
  let projectCriteria = {
      name : 1,
      id:1
  };
 let collegeData = await College.find({
     status: 1
 },projectCriteria)
     .catch(err => {
         return {
             success: 0,
             message: 'Something went wrong while getting colleges',
             error: err
         }
     })
 if (collegeData && collegeData.success && (collegeData.success === 0)) {
     return res.send(collegeData);
 }
 var responseObject = {
  colleges:collegeData,
      success:1,
      message: "college data listed"
 }
 return res.send(responseObject);

}

// exports.getColleges = async (req, res) => {
//   let collegesData = await College.find({
//     status : 1
//   },{
//     name : 1
//   })
//   .sort({ name: 'asc' })
//    .catch(err => {
//       return {
//         success: 0,
//         message: 'Something went wrong while getting colleges',
//         error: err
//       }
//     })
//   if (collegesData && collegesData.error && (collegesData.error !== null)) {
//     return res.send(collegesData);
//   }
// //   }
// //   let collegesData = await User.find({
// //     status: 1
// //   }, {
// //     college: 1
// //   })
// //   .sort({ college: 'asc' })
// //   .distinct('college')
// //     .catch(err => {
// //       return {
// //         success: 0,
// //         message: 'Something went wrong while getting colleges',
// //         error: err
// //       }
// //     })
// //   if (collegesData && collegesData.error && (collegesData.error !== null)) {
// //     return res.send(collegesData);
// //   }
// //   let uNames = new Map(collegesData.map(s => [s.toLowerCase(), s]));
// //   collegesData =  [...uNames.values()];
// //    collegesData = collegesData.filter(function(entry) { return entry.trim() != ''; });
// // //  console.log( [...uNames.values()])
//  return res.send({
//     success: 1,
//     colleges: collegesData,
//     message: 'College listed successfully'
//   })
// }