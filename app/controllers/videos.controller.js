var gateway = require('../components/gateway.component.js');

async function getVideos(reqObj) {
  let bearer = reqObj.bearer;
  delete reqObj.bearer;
  let videos = await gateway.getWithAuth('/videos', reqObj, bearer);

  return videos;
};

var Videos = require('../models/videos.model.js');
var Users = require('../models/user.model');
var config = require('../../config/app.config.js');
var SubCategory = require('../models/subCategory.model');
var VideoType = require('../models/videoType.model.js');
var Chapter = require('../models/chapter.model');
var Bookmark = require('../models/bookmark.model');
var ObjectId = require('mongoose').Types.ObjectId;
var videoConfig = config.videos;

exports.listVideos = async (req, res) => {

  let userData = req.identity.data;
  let userId = userData.id;
  let purchasedChapterIds = [];
  let isPurchased = undefined;

  var filters = {
    // chapterId: chapterId,
    status: 1
  };
  var queryProjection = {};
  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || videoConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : videoConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  var pageParams = {
    skip: offset,
    limit: perPage
  };

  /* Sort */
  var sortOptions = {};
  if (params.sortBy) {
    sortOrder = null;
    if (params.sortOrder && params.sortOrder == 'asc')
      sortOrder = 1;
    if (params.sortOrder && params.sortOrder == 'desc')
      sortOrder = -1;
    if (params.sortBy == 'popularity')
      sortOptions.viewCount = sortOrder ? sortOrder : -1;
    if (params.sortBy == 'time')
      sortOptions.tsCreatedAt = sortOrder ? sortOrder : -1;
    if (params.sortBy == 'rating')
      sortOptions.averageRating = sortOrder ? sortOrder : -1;
  } else {
    sortOptions.tsCreatedAt = -1;
  };

  let whereCondition = {
    _id: userId,
    status: 1
  }
  let ids = await Users.findOne(whereCondition, {
    purchasedChapterIds: 1
  })
  if (ids !== null) {
    purchasedChapterIds = ids.purchasedChapterIds;
  } else {
    return res.send({
      success: 0,
      message: 'User has not purchased any chapter'
    })
  }

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

  // )
  Videos.find(filters, queryProjection, pageParams)
    .sort(sortOptions)
    .limit(perPage)
    .populate({
      path: 'videoTypeId',
      VideoType,
      match: {
        status: 1
      },
      select: '_id name'
    }).populate({
      path: 'subCategoryId',
      VideoType,
      match: {
        status: 1
      },
      select: '_id name'
    })
    .lean()
    .then(videoList => {
      Videos.countDocuments(filters, function (err, itemsCount) {

        var i = 0;
        var items = [];
        var itemsCountCurrentPage = videoList.length;
        for (i = 0; i < itemsCountCurrentPage; i++) {
          if (videoList[i].videoTypeId.name !== 'Summary') {

            let chapterId = purchasedChapterIds.find(element => element == videoList[i].chapterId + "");
            if (chapterId) {
              isPurchased = true;
            } else {
              isPurchased = false;
            }

            if (isBookMarkedAvailable) {
              let id = bookmarkVideoIds.find(element => element.videoId == videoList[i]._id + "");
              if (id) {
                videoList[i].isBookMarked = true;
              } else {
                videoList[i].isBookMarked = false;
              }
            } else {
              videoList[i].isBookMarked = false;
            }

            videoList[i].isPurchased = isPurchased;
            items.push(videoList[i]);
          }
        }
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          success: 1,
          message: 'Videos listed successfully',
          imageBase: videoConfig.imageBase,
          items: items,
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
exports.getSummary = async (req, res) => {
  var summary = {};
  let bearer = req.headers['authorization'];
  console.log("inside getSummary")
  let topRequestObj = {
    page: 1,
    perPage: 10,
    bearer,
    sortBy: "averageRating"
  }
  let topVideos = await getVideos(topRequestObj)
    .catch(err => {
      return res.send({
        success: 0,
        message: 'Something went wrong while listing top rated videos',
        error: err
      })
    });

  let topRatedVideos = JSON.parse(topVideos)

  let newUploadRequestObj = {
    page: 1,
    perPage: 10,
    bearer,
    sortOrder: "desc",
    sortBy: "time"
  }
  let newUploadedVideos = await getVideos(newUploadRequestObj)
    .catch(err => {
      return res.send({
        success: 0,
        message: 'Something went wrong while listing newly uploaded videos',
        error: err
      })
    });
  let newlyUploadedVideos = JSON.parse(newUploadedVideos)
  let trainRequestObj = {
    page: 1,
    perPage: 10,
    bearer
  }
  let trainVideos = await getVideos(trainRequestObj)
    .catch(err => {
      return res.send({
        success: 0,
        message: 'Something went wrong while listing training videos',
        error: err
      })
    });
  let trainingVideos = JSON.parse(trainVideos);

  let topRatedVideoSummary = {
    imageBase: topRatedVideos.imageBase,
    thumbnailImageBase: videoConfig.thumbnailImageBase,
    totalItems: topRatedVideos.totalItems,
    items: topRatedVideos.items
  };
  let newlyUploadedVideosSummary = {
    imageBase: newlyUploadedVideos.imageBase,
    thumbnailImageBase: videoConfig.thumbnailImageBase,
    totalItems: newlyUploadedVideos.totalItems,
    items: newlyUploadedVideos.items
  };
  let trainingVideosSummary = {
    imageBase: trainingVideos.imageBase,
    thumbnailImageBase: videoConfig.thumbnailImageBase,
    totalItems: trainingVideos.totalItems,
    items: trainingVideos.items
  };

  summary.topRatedVideoSummary = topRatedVideoSummary;
  summary.newlyUploadedVideosSummary = newlyUploadedVideosSummary;
  summary.trainingVideosSummary = trainingVideosSummary;

  res.send({
    success: 1,
    message: 'Video summary fetched successfully',
    summary: summary
  });

}

exports.getHomeVideo = async (req, res) => {
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
  let bookmarkWhereCondition = {
    userId,
    status: 1
  }
  let bookmarkVideoIds = [];
  bookmarkVideoIds = await Bookmark.find(bookmarkWhereCondition, {
    videoId: 1
  }).lean();


  //list popular videos list
  let popularVideos = await Videos.find({
    status: 1
  }).populate({
    path: 'videoTypeId',
    VideoType,
    match: {
      status: 1
    },
    select: '_id name'
  }).populate({
    path: 'subCategoryId',
    VideoType,
    match: {
      status: 1
    },
    select: '_id name'
  }).limit(5).lean()
    .catch(err => {
      return res.send({
        success: 0,
        message: 'Something went wrong while listing popular videos',
        error: err
      })
    });
  let popularVideosArray = [];
  let isBookMarkedAvailable = true;
  if (bookmarkVideoIds.length < 1) {
    isBookMarkedAvailable = false;
  }
  //set video purchsed or not
  await Promise.all(popularVideos.map(async (item) => {
    if (item.videoTypeId.name !== "Summary") {
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

      popularVideosArray.push(item);
    }
  }));

  //find count of subcategories
  let count = await SubCategory.countDocuments({
    status: 1
  })
    .catch(err => {
      return res.send({
        success: 0,
        message: 'Something went wrong while getting subcategory count',
        error: err
      })
    });

  //find list subcategories
  let subCategories = await SubCategory.find({
    status: 1
  }).limit(6).lean()
    // }).skip(Math.random() * count).limit(3).lean()
    .catch(err => {
      return res.send({
        success: 0,
        message: 'Something went wrong while listing subcategories',
        error: err
      })
    });

  let subIdArray = [];
  for (let i = 0; i < subCategories.length; i++) {
    subIdArray[i] = subCategories[i]._id;
  }

  //find videos of subcategories 

  let videos = await Videos.find({
    subCategoryId: {
      $in: subIdArray
    },
    status: 1
  }).populate({
    path: 'videoTypeId',
    VideoType,
    match: {
      status: 1
    },
    select: '_id name'
  }).lean()
    .catch(err => {
      return res.send({
        success: 0,
        message: 'Something went wrong while listing subcategory videos',
        error: err
      })
    });
  let i = 0;
  let subCategoryVideoArray = [];

  //set the array of subcategories with videos and that video purchased or not

  await Promise.all(subCategories.map(async (item) => {
    let subCategoryId = item._id;
    item.videos = [];
    for (let i = 0; i < videos.length; i++) {
      if (JSON.stringify(subCategoryId) === JSON.stringify(videos[i].subCategoryId)) {
        if (ids !== null) {

          let id = ids.purchasedChapterIds.find(element => element == videos[i].chapterId + "");
          if (id) {
            videos[i].isPurchased = true;
          } else {
            videos[i].isPurchased = false;
          }
        } else {
          videos[i].isPurchased = false;
        }
        if (isBookMarkedAvailable) {
          let id = bookmarkVideoIds.find(element => element.videoId == videos[i]._id + "");
          if (id) {
            videos[i].isBookMarked = true;
          } else {
            videos[i].isBookMarked = false;
          }
        } else {
          videos[i].isBookMarked = false;
        }

        item.videos.push(videos[i]);
      }
    }
    subCategoryVideoArray.push(item);
  }));
  let responseObj = {
    success: 1,
    message: 'Home videos listed successfully',
    imageBase: videoConfig.imageBase,
    thumbnailImageBase: videoConfig.thumbnailImageBase,
    popularVideos: popularVideosArray,
    recommended: subCategoryVideoArray
  }
  res.send(responseObj);

}
exports.getChapterVideo = async (req, res) => {
  let params = req.params;
  let userData = req.identity.data;
  let userId = userData.id;
  let whereCondition = {
    _id: userId,
    status: 1
  }
  if (params.chapterId) {
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

    let subCategories = await SubCategory.find({
      status: 1,
      chapterId: params.chapterId.trim()
    }).lean()
      .catch(err => {
        return res.send({
          success: 0,
          message: 'Something went wrong while listing subcategories',
          error: err
        })
      });
    let chapter = await Chapter.findOne({
      status: 1,
      _id: params.chapterId.trim()
    }).lean()
      .catch(err => {
        return res.send({
          success: 0,
          message: 'Something went wrong while listing subcategories',
          error: err
        })
      });



    let subIdArray = [];

    for (let i = 0; i < subCategories.length; i++) {
      subIdArray[i] = subCategories[i]._id;
    }
    let videos = await Videos.find({
      subCategoryId: {
        $in: subIdArray
      },
      status: 1
    }).populate({
      path: 'videoTypeId',
      VideoType,
      match: {
        status: 1,
        // name: {$ne: 'Summary'}
      },
      select: '_id name'
    }).lean()
      .catch(err => {
        return res.send({
          success: 0,
          message: 'Something went wrong while listing subcategory videos',
          error: err
        })
      });
    let summary = await Videos.find({
      status: 1,
      chapterId: params.chapterId.trim(),
    })
      .populate({
        path: 'videoTypeId',
        VideoType,
        match: {
          status: 1,
          // name : "Summary"
        },
        select: '_id name'
      })
      .lean()
    // console.log("summary")
    // console.log(summary)
    // console.log("summary")

    if (ids !== null) {
      purchasedChapterIds = ids.purchasedChapterIds;
      let id = purchasedChapterIds.find(element => element == params.chapterId);
      if (id) {
        purchasedChapterIds.push(id);
        isPurchased = true;
      } else {
        isPurchased = false;
      }
    } else {
      isPurchased = false;
    }
    let summaryVideo = summary.find(element => element.videoTypeId.name == "Summary");

    if (summaryVideo) {
      summaryVideo.isPurchased = isPurchased;

      if (isBookMarkedAvailable) {
        let id = bookmarkVideoIds.find(element => element.videoId == summaryVideo._id + "");
        if (id) {
          summaryVideo.isBookMarked = true;
        } else {
          summaryVideo.isBookMarked = false;
        }
      } else {
        summaryVideo.isBookMarked = false;
      }
    } else {
      summaryVideo = null;
    }

    let subCategoryVideoArray = [];
    await Promise.all(subCategories.map(async (item) => {
      let subCategoryId = item._id;
      item.videos = [];
      for (let i = 0; i < videos.length; i++) {
        // if(videos[i].videoTypeId.name !== 'Summary'){
        if (JSON.stringify(subCategoryId) === JSON.stringify(videos[i].subCategoryId)) {
          videos[i].isPurchased = isPurchased;

          if (isBookMarkedAvailable) {
            let id = bookmarkVideoIds.find(element => element.videoId == videos[i]._id + "");
            if (id) {
              videos[i].isBookMarked = true;
            } else {
              videos[i].isBookMarked = false;
            }
          } else {
            videos[i].isBookMarked = false;
          }

          item.videos.push(videos[i]);
        }
        // }
      }

      if (item.videos.length > 0) {
        subCategoryVideoArray.push(item);
      }


    }));
    let responseObj = {
      success: 1,
      message: 'Home videos listed successfully',
      imageBase: videoConfig.imageBase,
      thumbnailImageBase: videoConfig.thumbnailImageBase,
      subCategories: subCategoryVideoArray,
      summaryVideo: summaryVideo
    }
    res.send(responseObj);
  }
};

exports.nextVideos = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.id;
  var chapterId = req.params.chapterId;
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
    chapterId: chapterId,
    status: 1
  };
  var queryProjection = {
    _id: 1,
    title: 1,
    averageRating: 1,
    length: 1,
    video: 1,
    thumbnail: 1,
    isFree: 1
  };
  var items = [];
  try {
    var userDeatils = await Users.findOne({
      _id: userId,
      status: 1
    });
    var purchasedChapterIds = userDeatils.purchasedChapterIds;
    let checkIfPurchased = purchasedChapterIds.includes(chapterId);
    let isPurchased = false;
    if (checkIfPurchased) {
      isPurchased = true;
    } else {
      isPurchased = false;
    }
    var result = await Videos.find(findCriteria, queryProjection);
    if (!result) {
      return res.send({
        success: 0,
        message: 'No videos found'
      })
    };

    for (var i = 0; i < result.length; i++) {
      var responseObj = {};
      
      responseObj._id = result[i]._id;
      responseObj.title = result[i].title;
      responseObj.video = result[i].video;
      responseObj.length = result[i].length;
      responseObj.averageRating = result[i].averageRating;
      responseObj.thumbnail = result[i].thumbnail;
      responseObj.isFree = result[i].isFree;
      responseObj.isPurchased = isPurchased;

      items.push(responseObj);
    }
  
    res.send({
      success: 1,
      message: 'Videos listed successfully',
      videoBase: videoConfig.imageBase,
      thumbnailImageBase: videoConfig.thumbnailImageBase,
      items: items
    })
  } catch (err) {
    res.send({
      success: 0,
      message: err.message
    });
  }
}


exports.markAsWatched = async (req, res) => {
  // var userData = req.identity.data;
  // var userId = userData.id;
  var userId = "5e8f1c6b8a0d600b38f2a522";
  var videoId = req.params.videoId;
  let whereCondition = {
    _id: videoId,
    status: 1
  }
  let videoData = await Videos.findOne(whereCondition)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting video data',
        error: err
      }
    })
  if (videoData && videoData.error && (videoData.error !== null)) {
    return res.send(videoData);
  }
  if (videoData) {
    var chapterId = videoData.chapterId;
    let userData = await Users.findOne({
      _id: userId,
      status: 1
    })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting user data',
          error: err
        }
      })
    if (userData && userData.error && (userData.error !== null)) {
      return res.send(userData);
    }
    let watchHistory = userData.watchHistory;
    let chapterIndex = watchHistory.findIndex(x => JSON.stringify(x.chapterId) == JSON.stringify(chapterId));
    if (chapterIndex > -1) {
      let watchedVideoIds = watchHistory[chapterIndex].watchedVideoIds;
      console.log("type : " + typeof videoId)
      let videoIndex = watchedVideoIds.findIndex(watchedVideoId => JSON.stringify(watchedVideoId) === JSON.stringify(videoId));
      if (videoIndex > -1) {
        res.send({
          success: 1,
          message: 'Already Video marked as watched',
        })
      }else{
        watchHistory[chapterIndex].watchedVideoIds.push(videoId);
        let updateData = await Users.update(
          { _id: userId },
          { watchHistory  }
        )
          .catch(err => {
            return {
              success: 0,
              message: 'Something went wrong while updating video watched',
              error: err
            }
          })
        if (updateData && updateData.error && (updateData.error !== null)) {
          return res.send(updateData);
        }
        res.send({
          success: 1,
          message: 'Video marked as watched',
        })
      }

     

    } else {
      let obj = {};
      obj.chapterId = chapterId;
      obj.watchedVideoIds = [];
      obj.watchedVideoIds.push(videoId);
      let updateData = await Users.update(
        { _id: userId },
        { $push: { watchHistory: obj } }
      )
        .catch(err => {
          return {
            success: 0,
            message: 'Something went wrong while updating video watched',
            error: err
          }
        })
      if (updateData && updateData.error && (updateData.error !== null)) {
        return res.send(updateData);
      }
      res.send({
        success: 1,
        message: 'Video marked as watched',
      })
    }

  } else {
    return res.send({
      success: 0,
      message: 'Invalid video..'
    })
  }
}
