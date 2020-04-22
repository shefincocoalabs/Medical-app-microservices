const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const subject = require('../controllers/subjects.controller.js');
    app.get('/subjects/checking',auth, subject.check);
    app.get('/subjects/list-subjects',auth, subject.listSubjects);
    app.get('/subjects/list-chapters/:id',auth, subject.listChapters);
    app.get('/subjects/list-chapters/chapter-details/:id',auth, subject.chapterDetail);
    app.get('/subjects/list-chapters/chapter-video-details/:id',auth, subject.chapterVideoDetail);
    app.post('/subjects/list-chapters/chapter-video-details/rate-video/:id',auth, subject.rateVideo);
    app.post('/subjects/list-chapters/chapter-video-details/boomark-video/:id',auth, subject.bookmarkVideo);
    app.delete('/subjects/list-chapters/chapter-video-details/boomark-video/remove/:id',auth, subject.removeBookmark);
    app.get('/subjects/list-chapters/chapter-details/buy-chapter/:id',auth, subject.buyChapters);
    app.post('/subjects/payment',auth, subject.payment);
};

  