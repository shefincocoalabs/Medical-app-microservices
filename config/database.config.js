module.exports = {
  development: {     
    // url: 'mongodb://@localhost:27017/Medical',
    url: 'mongodb://qadba2020:qaxon%402020@localhost:27017/Medical',

    // user: 'qadba2020', 
    // pass: 'qaxon@2020'
  },
  production: {
    url: 'mongodb://@localhost:27017/Medical',

    // url: 'mongodb+srv://admin:Cmx5tPxvRFCjB8F9@cluster0-trsnb.mongodb.net/Medical?retryWrites=true&w=majority'
    url: 'mongodb://qadba2020:qaxon%402020@localhost:27017/Medical/?compressors=disabled&gssapiServiceName=mongodb',
    user: 'qadba2020', 
    pass: 'qaxon@2020'

    // {user: '<USER_NAME>', pass: '<P@SS>'}
  }

}
