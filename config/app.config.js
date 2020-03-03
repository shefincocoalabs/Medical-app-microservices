var commonStorePath = 'http://172.104.61.150/learning/common/uploads/'
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
    url: "http://localhost:9000"
  },
  profile: {
    imageBase: commonStorePath + 'profile/'
  },
  subject: {
    imageBase: commonStorePath + '/images/books/categories/'
  },
  otp: {
    expirySeconds: 5 * 60
  },
  wishList: {
    resultsPerPage: 30
  },
  videos: {
    imageBase: commonStorePath + '/videos/images/',
    resultsPerPage: 30
  }
}
