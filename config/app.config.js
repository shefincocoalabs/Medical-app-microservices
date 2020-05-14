var commonStorePath = 'http://images.qaxon.in'
module.exports = {
  sms: {
    fromNo: "",
    key: "",
    route: "4"
  },
  jwt: {
    expirySeconds: 60 * 60
  },

  gateway: {
    url: "http://localhost:8081"
  },
  profile: {
    maxImageCount: 10,
    imageBase: commonStorePath + '/user-images/',
    imageUploadPath: '/var/www/html/images.qaxon.in/user-images/'
  },
  file: {
    imageBase: commonStorePath + '/files/'
  },
  subject: {
    imageBase: commonStorePath + '/images/books/categories/'
  },
  author: {
   imageBase: commonStorePath + '/images/books/categories/'
  },
  chapterBannerImage: {
    imageBase: commonStorePath + '/images/books/categories/'
  },
  otp: {
    expirySeconds: 2 * 60
  },
  wishList: {
    resultsPerPage: 30
  },
  videos: {
    imageBase: commonStorePath + '/videos/images/',
    thumbnailImageBase: commonStorePath + '/images/books/categories/',
    resultsPerPage: 30
  }
}
