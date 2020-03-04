module.exports = (app,methods,options) => {
    const subject = methods.loadController('subjects',options);
    subject.methods.get('/checking',subject.check, {auth:false});
    subject.methods.get('/list-subjects',subject.listSubjects, {auth:true});
    subject.methods.get('/list-chapters/:id',subject.listChapters, {auth:true});
    subject.methods.get('/list-chapters/chapter-details/:id',subject.chapterDetail, {auth:true});
    subject.methods.get('/list-chapters/chapter-video-details/:id',subject.chapterVideoDetail, {auth:true});
    subject.methods.post('/list-chapters/chapter-video-details/rate-video/:id',subject.rateVideo, {auth:true});
    subject.methods.post('/list-chapters/chapter-video-details/boomark-video/:id',subject.bookmarkVideo, {auth:true});
    subject.methods.delete('/list-chapters/chapter-video-details/boomark-video/remove/:id',subject.removeBookmark, {auth:true});
    subject.methods.get('/list-chapters/chapter-details/buy-chapter/:id',subject.buyChapters, {auth:true});
    subject.methods.post('/payment',subject.payment, {auth:true});

}