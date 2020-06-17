  var subjects = require('../models/subject.model.js');
  var chapters = require('../models/chapter.model.js');
  var Authors = require('../models/author.model.js');
  var Videos = require('../models/videos.model.js');
  var Notes = require('../models/note.model.js');
  var Users = require('../models/user.model');
  var VideoType = require('../models/videoType.model.js');
  var Bookmark = require('../models/bookmark.model.js');
  var VideoRatings = require('../models/videoRating.model.js');
  var SubCategories = require('../models/subCategory.model');
  var Payment = require('../models/payment.model');
  var config = require('../../config/app.config.js');
  var subjectImageBase = config.subject.imageBase;
  var chapterBannerImageBase = config.chapterBannerImage.imageBase;
  var ObjectId = require('mongoose').Types.ObjectId;
  var moment = require('moment');
  var videoConfig = config.videos;
  var authorConfig = config.author;
  var authorImageBase = authorConfig.imageBase;
  var noteConfig = config.file;

  // *** API for getting subject list ***
  exports.listSubjects = (req, res) => {
    var findCriteria = {
      status: 1
    };
    var queryProjection = {
      id: 1,
      name: 1,
      image: 1,
      gradientStartColorHex: 1,
      gradientEndColorHex: 1
    };
    subjects.find(findCriteria, queryProjection).then(result => {
      res.send({
        success: 1,
        message: 'Subjects listed successfully',
        imageBase: subjectImageBase,
        items: result
      })
    }).catch(err => {
      res.send({
        success: 0,
        message: err || 'Error while fetching subjects list'
      })
    })
  }

  // *** API for listing chapters under a particular subject ***
  exports.listChapters = async (req, res) => {
    var subjectId = req.params.id;
    var isValidId = ObjectId.isValid(subjectId);
    var userData = req.identity.data;
    var userId = userData.id;
    if (!isValidId) {
      var responseObj = {
        success: 0,
        status: 401,
        errors: [{
          field: "id",
          message: "id is invalid"
        }]
      }
      res.send(responseObj);
      return;
    }
    var findCriteria = {
      subjectId: subjectId,
      status: 1
    };
    var queryProjection = {
      _id: 1,
      title: 1,
      subtitle: 1,
      image: 1,
      bannerImage: 1,
      gradientStartColorHex: 1,
      gradientEndColorHex: 1
    };
    try {
      var userDeatils = await Users.findOne({
        _id: userId,
        status: 1
      });
      var purchasedChapterIds = userDeatils.purchasedChapterIds;
      var chaptersList = await chapters.find(findCriteria, queryProjection);
      if (!chaptersList) {
        return res.send({
          success: 0,
          message: 'Chapter list not found'
        })
      };
      let watchHistory = null;

      if(userDeatils.watchHistory){
        watchHistory = userDeatils.watchHistory;
      }
      console.log("watchHistory")
      console.log(watchHistory)
      console.log("watchHistory")
      var resultArray = [];
      for (let i = 0; i < chaptersList.length; i++) {
        let viewedVideosCount = 0;
        let resultObj = {};
        let chapterId = chaptersList[i]._id;
        let countVideos = await Videos.countDocuments({
          chapterId: chapterId,
          status: 1
        });
        if(watchHistory !== null){
        let chapterIndex = watchHistory.findIndex(x => JSON.stringify(x.chapterId) == JSON.stringify(chapterId));
        if(chapterIndex > -1){
          viewedVideosCount = watchHistory[chapterIndex].watchedVideoIds.length;
        }
        }
        let checkIfPurchased = purchasedChapterIds.includes(chapterId);
        resultObj._id = chaptersList[i]._id;
        resultObj.title = chaptersList[i].title;
        resultObj.subtitle = chaptersList[i].subtitle;
        resultObj.image = chaptersList[i].image;
        resultObj.bannerImage = chaptersList[i].bannerImage;
        resultObj.gradientStartColorHex = chaptersList[i].gradientStartColorHex;
        resultObj.gradientEndColorHex = chaptersList[i].gradientEndColorHex;
        resultObj.videosCount = countVideos;
        resultObj.viewedVideosCount = viewedVideosCount;
        if (checkIfPurchased) {
          resultObj.purchased = true;
        } else {
          resultObj.purchased = false;
        }
        resultArray.push(resultObj);
      }
      var chapterListLength = chaptersList.length;
      res.send({
        success: 1,
        message: 'Chapter listed successfully',
        chaptersCount: chapterListLength,
        chapterList: resultArray
      });
    } catch (err) {
      res.send({
        success: 0,
        message: err.message
      });
    }

  }

  // *** API for getting chapter details ***
  exports.chapterDetail = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var chapterId = req.params.id;
    var isValidId = ObjectId.isValid(chapterId);
    if (!isValidId) {
      var responseObj = {
        success: 0,
        status: 401,
        errors: [{
          field: "id",
          message: "id is invalid"
        }]
      }
      res.send(responseObj);
      return;
    }
    var findCriteria = {
      _id: chapterId,
      status: 1
    };
    var chapterVideoFindCriteria = {
      chapterId: chapterId,
      status: 1
    }
    var queryProjection = {
      _id: 1,
      title: 1,
      subtitle: 1,
      description: 1,
      image: 1,
      bannerImage: 1,
      gradientStartColorHex: 1,
      gradientEndColorHex: 1
    };
    var userDeatils = await Users.findOne({
      _id: userId,
      status: 1
    });
    var purchasedChapterIds = userDeatils.purchasedChapterIds;
    let checkIfPurchased = purchasedChapterIds.includes(chapterId);
    var chapter = await chapters.findOne(findCriteria, queryProjection).populate({
      path: 'authorIds',
      Authors,
      match: {
        status: 1
      },
      select: 'name image activeFromYear activeToYear biography'
    }).catch(err => {
      return res.send({
        success: 0,
        message: 'Something went wrong while fetching chapterDetails data',
        error: err
      })
    });
    if (!chapter) {
      return res.send({
        success: 0,
        message: 'Chapter details not found fo this Id'
      })
    }
    var projectChapterVideoData = {
      _id: 1,
      title: 1,
      video: 1,
      length: 1,
      videoTypeId: 1
    };
    var chapterVideos = await Videos.find(chapterVideoFindCriteria, projectChapterVideoData).limit(4).populate({
      path: 'videoTypeId',
      VideoType,
      match: {
        status: 1
      },
      select: '_id name'
    }).catch(err => {
      return res.send({
        success: 0,
        message: 'Something went wrong while fetching chapterVideos data',
        error: err
      })
    })
    var chapterDetails = {};
    chapterDetails.author = chapter ? chapter.authorIds : '';
    chapterDetails._id = chapter ? chapter._id : '';
    chapterDetails.title = chapter ? chapter.title : '';
    chapterDetails.subtitle = chapter ? chapter.subtitle : '';
    chapterDetails.description = chapter ? chapter.description : '';
    chapterDetails.image = chapter ? chapter.image : '';
    chapterDetails.bannerImage = chapter ? chapter.bannerImage : '';
    chapterDetails.gradientStartColorHex = chapter ? chapter.gradientStartColorHex : '';
    chapterDetails.gradientEndColorHex = chapter ? chapter.gradientEndColorHex : '';
    if (checkIfPurchased) {
      chapterDetails.purchased = true;
    } else {
      chapterDetails.purchased = false;
    }
    // chapterDetails.chapterVideos = chapterVideos;
    res.send({
      success: 1,
      message: 'Chapters details listed successfully',
      authorImageBase: authorImageBase,
      chapterBannerImageBase: chapterBannerImageBase,
      thumbnailImageBase: videoConfig.thumbnailImageBase,
      chapterDetails: chapterDetails,
    })
  };
  // *** API for getting video detail of a chapter ***
  exports.chapterVideoDetail = async (req, res) => {
    var videoId = req.params.id;
    var isValidId = ObjectId.isValid(videoId);
    if (!isValidId) {
      var responseObj = {
        success: 0,
        status: 401,
        errors: [{
          field: "id",
          message: "id is invalid"
        }]
      }
      res.send(responseObj);
      return;
    }
    let userData = req.identity.data;
    let userId = userData.id;
    let whereCondition = {
      _id: userId,
      status: 1
    }
    //find user purchased chapters
    let ids = await Users.findOne(whereCondition, {
        purchasedChapterIds: 1
      })
      .catch(err => {
        return res.send({
          success: 0,
          message: 'Something went wrong while getting purchase chapters',
          error: err
        })
      });

    //find user bookmarked videos
    let bookmarkWhereCondition = {
      userId,
      status: 1
    }
    let bookmarkVideoIds = [];
    bookmarkVideoIds = await Bookmark.find(bookmarkWhereCondition, {
      videoId: 1
    }).lean();

    let isBookMarkedAvailable = true;
    if (bookmarkVideoIds.length < 1) {
      isBookMarkedAvailable = false;
    }


    var findCriteria = {
      _id: videoId,
      status: 1
    };
    var queryProjection = {
      noteIds: 1,
      _id: 1,
      title: 1,
      videoTypeId: 1,
      subjectId: 1,
      video: 1,
      length: 1,
      description: 1,
      isFree: 1,
      averageRating: 1,
      chapterId: 1,
      subCategoryId: 1,
      status: 1

    };
    let result = await Videos.findOne(findCriteria, queryProjection).populate({
        path: 'noteIds',
        Notes,
        match: {
          status: 1
        },
        select: '_id name file '
      }).populate({
        path: 'videoTypeId',
        VideoType,
        match: {
          status: 1
        },
        select: '_id name'
      }).populate({
        path: 'subjectId',
        subjects,
        match: {
          status: 1,
        },
        select: '_id name'
      })
      .populate({
        path: 'chapterId',
        chapters,
        match: {
          status: 1
        },
        select: '_id title subtitle'
      })
      .populate({
        path: 'subCategoryId',
        chapters,
        match: {
          status: 1
        },
        select: '_id chapterId name status sortOrder'
      }).lean()
      .catch(err => {
        return res.send({
          success: 0,
          message: 'Something went wrong while fetching videos data',
          error: err
        })
      })
    if (result.noteIds) {
      if (result.noteIds[0]) {
        let fullNotePath = noteConfig.imageBase + "" + result.noteIds[0].file;
        result.noteIds[0].file = fullNotePath;
      }
    }
    let chapterId = result.chapterId._id;
    if (ids !== null) {
      let id = ids.purchasedChapterIds.find(element => element == chapterId + "");
      if (id) {
        result.isPurchased = true;
      } else {
        result.isPurchased = false;
      }
    } else {
      result.isPurchased = false;
    }
    if (isBookMarkedAvailable) {
      let id = bookmarkVideoIds.find(element => element.videoId == videoId + "");
      if (id) {
        result.isBookMarked = true;
      } else {
        result.isBookMarked = false;
      }
    } else {
      result.isBookMarked = false;
    }


    // let subCategoryId = result.subCategoryId._id;
    let next = {};
    let prev = {};
    console.log(result);
    if (result.videoTypeId.name !== "Summary") {
      let sortOrder = result.subCategoryId.sortOrder;

      next = await SubCategories.findOne({
        sortOrder: {
          $gt: sortOrder
        },
        chapterId,
        status: 1
      }).sort({
        sortOrder: 1
      }).limit(1).lean()
      prev = await SubCategories.findOne({
        sortOrder: {
          $lt: sortOrder
        },
        chapterId,
        status: 1
      }).sort({
        sortOrder: 1
      }).limit(1).lean()
    } else {
      console.log('else');
      next = null;
      prev = await SubCategories.findOne({
        chapterId,
        status: 1
      }).sort({
        sortOrder: -1
      }).limit(1).lean()
      console.log(prev);
    }
    if (next != null) {
      let nextVideos = await Videos.find({
          chapterId,
          subCategoryId: next._id,
          status: 1
        })
        .populate({
          path: 'videoTypeId',
          VideoType,
          match: {
            status: 1
          },
          select: '_id name'
        }).lean()
      next.videos = [];
      await Promise.all(nextVideos.map(async (item) => {
        if (ids !== null) {
          let id = ids.purchasedChapterIds.find(element => element == item.chapterId + "");
          if (id) {
            item.isPurchased = true;
          } else {
            item.isPurchased = false;
          }
        } else {
          item.isPurchased = false;

        }
        if (isBookMarkedAvailable) {
          let id = bookmarkVideoIds.find(element => element.videoId == item._id + "");
          if (id) {
            item.isBookMarked = true;
          } else {
            item.isBookMarked = false;
          }
        } else {
          item.isBookMarked = false;
        }

        next.videos.push(item);
      }));
    } else {
      next = null;
    }

    if (prev != null) {
      let prevVideos = await Videos.find({
          chapterId,
          subCategoryId: prev._id,
          status: 1
        })
        .populate({
          path: 'videoTypeId',
          VideoType,
          match: {
            status: 1
          },
          select: '_id name'
        }).lean()

      prev.videos = [];

      await Promise.all(prevVideos.map(async (item) => {
        if (ids !== null) {
          let id = ids.purchasedChapterIds.find(element => element == item.chapterId + "");
          if (id) {
            item.isPurchased = true;
          } else {
            item.isPurchased = false;
          }
        } else {
          item.isPurchased = false;

        }
        if (isBookMarkedAvailable) {
          let id = bookmarkVideoIds.find(element => element.videoId == item._id + "");
          if (id) {
            item.isBookMarked = true;
          } else {
            item.isBookMarked = false;
          }
        } else {
          item.isBookMarked = false;
        }

        prev.videos.push(item);
      }));
    } else {
      prev = null
    }

    res.send({

      imageBase: videoConfig.imageBase,
      thumbnailImageBase: videoConfig.thumbnailImageBase,
      success: 1,
      message: 'video details listed successfully',
      items: result,
      next,
      prev

    })
  }

  // *** API for submitting rating of a video ***
  exports.rateVideo = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var videoId = req.params.id;
    var rating = req.body.rating;
    var isValidId = ObjectId.isValid(videoId);
    var findCriteria = {
      userId: userId,
      videoId: videoId
    };
    var update = {
      rating: rating
    };
    var i;
    var totalRating = 0;
    var averageRating;
    var numberOfRatings;
    if (!rating) {
      return res.send({
        success: 0,
        message: 'Rating cannot be empty'
      })
    }
    if (!isValidId) {
      var responseObj = {
        success: 0,
        status: 401,
        errors: [{
          field: "id",
          message: "id is invalid"
        }]
      }
      res.send(responseObj);
      return;
    }
    VideoRatings.find({
      userId: userId,
      videoId: videoId,
      status: 1
    }).then(async response => {
      if (response.length == 0) {
        const newRating = new VideoRatings({
          rating: rating,
          userId: userId,
          videoId: videoId,
          status: 1,
          tsCreatedAt: Number(moment().unix()),
          tsModifiedAt: null
        });
        newRating.save()
          .then(async data => {
            var formattedData = {
              success: 1,
              message: "Rating submitted"
            };
            res.send(formattedData);
          }).catch(err => {
            res.status(500).send({
              success: 0,
              status: 500,
              message: err.message || "Some error occurred while submitting rating."
            });
          });
      } else {
        VideoRatings.update(findCriteria, update).then(result => {
          var formattedData = {
            success: 1,
            message: "Rating submitted"
          };
          res.send(formattedData);
        }).catch(err => {
          res.status(500).send({
            success: 0,
            status: 500,
            message: err.message || "Some error occurred while submitting rating."
          });
        });
      }

      var videoRatings = await VideoRatings.find({
        videoId: videoId,
        status: 1
      })
      numberOfRatings = videoRatings.length;
      for (i = 0; i < numberOfRatings; i++) {
        totalRating = totalRating + parseFloat(videoRatings[i].rating);
      }
      averageRating = (totalRating / numberOfRatings).toFixed(2);
      var updateVideoRating = await Videos.update({
        _id: videoId
      }, {
        averageRating: averageRating.toString()
      })
    })
  }

  // *** API for bookmark a video ***
  exports.bookmarkVideo = (req, res) => {
    var videoId = req.params.id;
    var userData = req.identity.data;
    var userId = userData.id;
    var isValidId = ObjectId.isValid(videoId);
    var findCriteria = {
      userId: userId,
      videoId: videoId
    };
    var update = {
      status: 1
    };
    if (!isValidId) {
      var responseObj = {
        success: 0,
        status: 401,
        errors: [{
          field: "id",
          message: "id is invalid"
        }]
      }
      res.send(responseObj);
      return;
    }

    Bookmark.find({
      userId: userId,
      videoId: videoId
    }).then(response => {
      if (response.length == 0) {
        const newBookmark = new Bookmark({
          videoId: videoId,
          userId: userId,
          status: 1,
          tsCreatedAt: Number(moment().unix()),
          tsModifiedAt: null
        });
        newBookmark.save()
          .then(data => {
            var formattedData = {
              success: 1,
              message: "video bookmarked successfully"
            };
            res.send(formattedData);
          }).catch(err => {
            res.status(500).send({
              success: 0,
              status: 500,
              message: err.message || "Some error occurred while bookmarking video"
            });
          });
      } else {
        Bookmark.update(findCriteria, update).then(result => {
          var formattedData = {
            success: 1,
            message: "video bookmarked successfully"
          };
          res.send(formattedData);
        })
      }
    })

  }
  // *** API for remove bookmark ***
  exports.removeBookmark = (req, res) => {
    var videoId = req.params.id;
    var userData = req.identity.data;
    var userId = userData.id;
    var findCriteria = {
      userId: userId,
      videoId: videoId
    };
    var update = {
      status: 0
    };
    Bookmark.update(findCriteria, update).then(result => {
      res.send({
        success: 1,
        message: 'Bookmark removed successfully'
      })
    })
  };

  // *** API for getting order summary for buying a chapter ***
  exports.buyChapters = (req, res) => {
    var chapterId = req.params.id;
    var findCriteria = {
      chapterId: chapterId,
      status: 1
    };
    var queryProjection = {
      _id: 1,
      title: 1,
      price: 1
    };
    var videosCount;
    chapters.findOne({
      _id: chapterId,
      status: 1
    }, queryProjection).then(chapterResponse => {
      Videos.find(findCriteria).then(result => {
        videosCount = result.length;
        res.send({
          success: 1,
          message: 'Chapter summary fetched successfully',
          videosCount: videosCount,
          orderSummary: chapterResponse
        });
      })
    })
  }
  // *** API for payment status update ***

  exports.payment = async (req, res) => {
    let userData = req.identity.data;
    let userId = userData.id;
    let transactionId = req.body.transactionId;
    let amount = req.body.amount;
    let paidStatus = req.body.paidStatus;
    let paidOn = req.body.paidOn;
    let chapterId = req.body.chapterId;
    if (!transactionId || !amount || !paidStatus || !paidOn || !chapterId) {
      var errors = [];
      if (!transactionId) {
        errors.push({
          field: "transactionId",
          message: "transactionId cannot be empty"
        });
      }
      if (!amount) {
        errors.push({
          field: "amount",
          message: "amount cannot be empty"
        });
      }
      if (!paidStatus) {
        errors.push({
          field: "paidStatus",
          message: "paidStatus cannot be empty"
        });
      }
      if (!paidOn) {
        errors.push({
          field: "paidOn",
          message: "paidOn cannot be empty"
        });
      }
      if (!chapterId) {
        errors.push({
          field: "chapterId",
          message: "chapterId cannot be empty"
        });
      }
      return res.send({
        success: 0,
        errors: errors,
      });
    }
    let paymentData = {
      userId,
      transactionId: transactionId,
      chapterId,
      amount: amount,
      paidStatus: paidStatus,
      paidOn: paidOn,
      status: 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    }
    const newPayment = new Payment(paymentData);
    try {
      let savePayement = await newPayment.save();
      let updatePurchasedChapters = await Users.update({
        _id: userId
      }, {
        $push: {
          purchasedChapterIds: chapterId
        }
      });
      var paymentResponse = {
        success: 1,
        message: "Payment status submitted successfully"
      };
      res.send(paymentResponse);
    } catch (err) {
      res.send({
        success: 0,
        message: err.message
      });
    }
  };
