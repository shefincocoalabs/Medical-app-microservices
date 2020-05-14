module.exports = {
  development: {     
    // url: 'mongodb://@localhost:27017/Medical',
    url: 'mongodb://qadba2020:qaxon%402020@localhost:27017/qaxon',

    // user: 'qadba2020', 
    // pass: 'qaxon@2020'
  },
  production: {
    // url: 'mongodb://@localhost:27017/qaxon',
    url: 'mongodb://qadba2020:qaxon%402020.com@127.0.0.1:27017/qaxon?authSource=admin',

    // url: 'mongodb+srv://admin:Cmx5tPxvRFCjB8F9@cluster0-trsnb.mongodb.net/Medical?retryWrites=true&w=majority'
    // url: 'mongodb://127.0.0.1:27017',
    // user: 'qadba2020', 
    // pass: 'qaxon@2020',
    // authObj :{
    //   "auth": {
    //     "authSource": "admin"
    //   },
    //   "user": "qadba2020",
    //   "pass": "qaxon@2020.com"
    // }

    // {user: '<USER_NAME>', pass: '<P@SS>'}
  }

}
