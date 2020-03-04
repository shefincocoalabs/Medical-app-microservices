function subjectController(methods, options) {
  var subjects = require('../models/subject.model.js');
  var chapters = require('../models/chapter.model.js');
  var Authors = require('../models/author.model.js');
  var Videos = require('../models/videos.model.js');
  var Notes = require('../models/note.model.js');
  var VideoType = require('../models/videoType.model.js');
  var Bookmark = require('../models/bookmark.model.js');
  var VideoRatings = require('../models/videoRating.model.js');
  var Payment = require('../models/payment.model');
  var config = require('../../config/app.config.js');
  var subjectImageBase = config.subject.imageBase;
  var ObjectId = require('mongoose').Types.ObjectId;
  var moment = require('moment');

  // *** API for getting subject list ***
  this.listSubjects = (req, res) => {
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
  this.listChapters = (req, res) => {
    var subjectId = req.params.id;
    var isValidId = ObjectId.isValid(subjectId);
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
    chapters.find(findCriteria, queryProjection).then(result => {
      if (!result) {
        return res.send({
          success: 0,
          message: 'Chapter list not found'
        })
      }
      var chapterListLength = result.length;
      res.send({
        success: 1,
        message: 'Chapter listed successfully',
        chaptersCount: chapterListLength,
        chapterList: result
      });
    })
  }

  // *** API for getting chapter details ***
  this.chapterDetail = async (req, res) => {
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
    }
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
    chapterDetails.chapter = chapter;
    chapterDetails.chapterVideos = chapterVideos;
    res.send({
      success: 1,
      message: 'Chapters details listed successfully',
      chapterDetails: chapterDetails,
    })
  };
  // *** API for getting video detail of a chapter ***
  this.chapterVideoDetail = (req, res) => {
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
    var findCriteria = {
      _id: videoId
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
      chapterId: 1
    };
    Videos.findOne(findCriteria, queryProjection).populate({
        path: 'noteIds',
        Notes,
        match: {
          status: 1
        },
        select: '_id name file'
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
      .then(result => {
        res.send({
          success: 1,
          message: 'video details listed successfully',
          items: result
        })
      })
  }

  // *** API for submitting rating of a video ***
  this.rateVideo = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var rating = req.body.rating;
    if (!rating) {
      return res.send({
        success: 0,
        message: 'Rating cannot be empty'
      })
    }
    const newRating = new VideoRatings({
      rating: rating,
      userId: userId,
      status: 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    });
    newRating.save()
      .then(data => {
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

  // *** API for bookmark a video ***
  this.bookmarkVideo = (req, res) => {
    var videoId = req.params.id;
    var userData = req.identity.data;
    var userId = userData.id;
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
  }
  // *** API for remove bookmark ***
  this.removeBookmark = (req, res) => {
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
  this.buyChapters = (req, res) => {
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
    },queryProjection).then(chapterResponse => {
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

  this.payment = (req, res) => {
    let userData = req.identity.data;
    let userId = userData.id;
    let paymentData = {
      userId,
      transactionId : req.body.transactionId,
      amount : req.body.amount,
      paidStatus : req.body.paidStatus,
      paidOn : req.body.paidOn,
      status : 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    }
    const newPayment =  new Payment(paymentData);
    newPayment.save()
    .then(data => {
      var paymentResponse = {
        success: 1,
        message: "Payment status submitted successfully"
      };
      res.send(paymentResponse);
    }).catch(err => {
      res.status(500).send({
        success: 0,
        status: 500,
        message: err.message || "Some error occurred while payment"
      });
    });
  }

}
module.exports = subjectController
