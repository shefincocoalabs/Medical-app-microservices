module.exports = (app,methods,options) => {
    const video = methods.loadController('videos',options);
    video.methods.get('/',video.listVideos, {auth:false});
    video.methods.get('/summary',video.getSummary, {auth:false});
    
}