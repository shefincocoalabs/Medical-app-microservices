var gateway = require('../components/gateway.component.js');

async function getVideos(reqObj) {
  let bearer = reqObj.bearer;
  delete reqObj.bearer;
  let videos = await gateway.getWithAuth('/videos', reqObj, bearer);
  return videos;
};

function videoController(methods, options) {
  var Videos = require('../models/videos.model.js');
  var Users = require('../models/user.model');
  var config = require('../../config/app.config.js');
  var SubCategory = require('../models/subCategory.model');
  var VideoType = require('../models/videoType.model.js');
  var Chapter = require('../models/chapter.model');
  var Bookmark = require('../models/bookmark.model');

  var videoConfig = config.videos;
  this.listVideos = async (req, res) => {

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
  this.getSummary = async (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization'];

    let topRequestObj = {
      page: 1,
      perPage: 10,
      bearer
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
      sortOrder: "asc",
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

  this.getHomeVideo = async (req, res) => {
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
      }).limit(3).lean()
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
  this.getChapterVideo = async (req, res) => {
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

      let summaryVideo = {
        summaryVideoId: chapter._id,
        summaryVideo: chapter.summaryVideo,
        summaryVideoTitle: chapter.summaryVideoTitle,
        summaryVideoThumbnail: chapter.thumbnail
      }

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
      let subCategoryVideoArray = [];
      await Promise.all(subCategories.map(async (item) => {
        let subCategoryId = item._id;
        item.videos = [];
        for (let i = 0; i < videos.length; i++) {
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
        }
        subCategoryVideoArray.push(item);
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
  }

}
module.exports = videoController;
