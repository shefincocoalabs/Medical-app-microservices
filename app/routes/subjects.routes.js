module.exports = (app,methods,options) => {
    const subject = methods.loadController('subject',options);
    subject.methods.get('/checking',subject.check, {auth:false});
    subject.methods.get('/list-subjects',subject.listSubjects, {auth:false});
    subject.methods.get('/list-chapters/:id',subject.listChapters, {auth:false});
    subject.methods.get('/list-chapters/chapter-details/:id',subject.chapterDetail, {auth:false});
    subject.methods.get('/list-chapters/chapter-video-details/:id',subject.chapterVideoDetail, {auth:false});
    subject.methods.post('/list-chapters/chapter-video-details/rate-video/:id',subject.rateVideo, {auth:false});
    subject.methods.post('/list-chapters/chapter-video-details/boomark-video/:id',subject.bookmarkVideo, {auth:true});
    subject.methods.delete('/list-chapters/chapter-video-details/boomark-video/remove/:id',subject.removeBookmark, {auth:true});
    subject.methods.get('/list-chapters/chapter-details/buy-chapter/:id',subject.buyChapters, {auth:false});
}