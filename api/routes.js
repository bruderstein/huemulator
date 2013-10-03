
var lightsApi = require('./lights');
var configApi = require('./config');

exports.addRoutes = function(server) {
    lightsApi.addRoutes(server);
    configApi.addRoutes(server);
}