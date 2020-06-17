const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const video = require('../controllers/videos.controller.js');
    app.get('/videos',auth, video.listVideos);
    app.get('/videos/summary',auth, video.getSummary);
    app.get('/videos/home',auth, video.getHomeVideo);
    app.get('/videos/chapter/:chapterId',auth, video.getChapterVideo);
    app.get('/videos/next-videos/:chapterId',auth, video.nextVideos);
    // app.get('/videos/:videoId/mark-as-watched',auth, video.markAsWatched);
    app.post('/videos/:videoId/mark-as-watched', video.markAsWatched);
};

