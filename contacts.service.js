var server = require('./server.js'); 
var routes = ['contacts'];
var serviceName = "contacts";
server.start(serviceName, routes);