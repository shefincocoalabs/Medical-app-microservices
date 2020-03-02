var gateway = require('../components/gateway.component.js');

async function getVideos(perPage) {
  let videos = await gateway.get('/videos', {
    page: 1,
    perPage: perPage
  });
  return videos;
};

function videoController(methods, options) {
  var Videos = require('../models/videos.model.js');
  var config = require('../../config/app.config.js');
  var videoConfig = config.videos;
  this.listVideos = (req, res) => {
    var filters = {
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

    Videos.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(videoList => {
      Videos.countDocuments(filters, function (err, itemsCount) {
        var i = 0;
        var items = [];

        var itemsCountCurrentPage = videoList.length;
        for (i = 0; i < itemsCountCurrentPage; i++) {

          items.push({
            id: videoList[i]._id,
            title: videoList[i].title || null,
            image: videoList[i].video || null,
            averageRating: videoList[i].averageRating || null,
            maxRating: videoList[i].length || null
          });
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
    let popVideos = await getVideos(10)
      .catch(err => {
        return res.send({
          success: 0,
          message: 'Something went wrong while listing popular videos',
          error: err
        })
      });
    let popularVideos = JSON.parse(popVideos)

    let topVideos = await getVideos(10)
      .catch(err => {
        return res.send({
          success: 0,
          message: 'Something went wrong while listing top rated videos',
          error: err
        })
      });
    let topRatedVideos = JSON.parse(topVideos)

    let newUploadedVideos = await getVideos(10)
      .catch(err => {
        return res.send({
          success: 0,
          message: 'Something went wrong while listing newly uploaded videos',
          error: err
        })
      });
    let newlyUploadedVideos = JSON.parse(newUploadedVideos)

    let trainVideos = await getVideos(10)
      .catch(err => {
        return res.send({
          success: 0,
          message: 'Something went wrong while listing training videos',
          error: err
        })
      });
    let trainingVideos = JSON.parse(trainVideos);

    let recommendVideos = await getVideos(10)
      .catch(err => {
        return res.send({
          success: 0,
          message: 'Something went wrong while listing recommended videos',
          error: err
        })
      })
    let recommendedVideos = JSON.parse(recommendVideos);

    let poplularVideosSummary = {
      imageBase: popularVideos.imageBase,
      totalItems: popularVideos.totalItems,
      items: popularVideos.items
    };
    let topRatedVideoSummary = {
      imageBase: topRatedVideos.imageBase,
      totalItems: topRatedVideos.totalItems,
      items: topRatedVideos.items
    };
    let newlyUploadedVideosSummary = {
      imageBase: newlyUploadedVideos.imageBase,
      totalItems: newlyUploadedVideos.totalItems,
      items: newlyUploadedVideos.items
    };
    let trainingVideosSummary = {
      imageBase: trainingVideos.imageBase,
      totalItems: trainingVideos.totalItems,
      items: trainingVideos.items
    };

    let recommendedVideosSummary = {
      imageBase: recommendedVideos.imageBase,
      totalItems: recommendedVideos.totalItems,
      items: recommendedVideos.items
    };
    summary.topRatedVideoSummary = topRatedVideoSummary;
    summary.newlyUploadedVideosSummary = newlyUploadedVideosSummary;
    summary.trainingVideosSummary = trainingVideosSummary;
    summary.poplularVideosSummary = poplularVideosSummary;
    summary.recommendedVideosSummary = recommendedVideosSummary;
    res.send({
      success: 1,
      message: 'Video summary fetched successfully',
      summary: summary
    });

  }
}
module.exports = videoController;
