var server = require('./server.js'); 
var routes = ['videos'];
var serviceName = "videos";
server.start(serviceName, routes);