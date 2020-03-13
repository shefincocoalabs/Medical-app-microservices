module.exports = (app,methods,options) => {
    const video = methods.loadController('videos',options);
    video.methods.get('/',video.listVideos, {auth:true});
    video.methods.get('/summary',video.getSummary, {auth:true});
    video.methods.get('/home',video.getHomeVideo, {auth:true});
    video.methods.get('/chapter/:chapterId',video.getChapterVideo, {auth:true});
    video.methods.get('/next-videos/:chapterId',video.nextVideos, {auth:true});

}