var remoteApiNotification = require('../app/remoteApiNotification');

var lightsApi = require('./lights');
var configApi = require('./config');
var groupsApi = require('./groups');
var discoveryApi = require('./discovery');
var webApi = require('../webapi/control');
var hapi = require('hapi');


function fixRequest(request) {
    request.payload = JSON.parse(request.rawPayload.toString());
}

function failedApiCallHandler(request) {
    fixRequest(request);
    remoteApiNotification.notifyFailedApiCall(request, {code:404,error:'Not Found'});
    var e = hapi.error.notFound('Unknown or unsupported API call');
    request.reply(e)
}


exports.addRoutes = function(server) {
    lightsApi.addRoutes(server);
    configApi.addRoutes(server);
    groupsApi.addRoutes(server);
    discoveryApi.addRoutes(server);
    webApi.addRoutes(server);
    server.route( [      // We should be able to use method:'*' for this, but that doesn't seem to work, at least with hapi 1.11
        {
            method: 'GET'
            , path: "/api/{path*}"
            , handler: failedApiCallHandler
        }
        , {
            method : 'POST'
            , path: '/api/{path*}'
            , handler: failedApiCallHandler
        }
        , {
            method : 'PUT'
            , path: '/api/{path*}'
            , handler: failedApiCallHandler
        }
        , {
            method: 'DELETE'
            , path: '/api/{path*}'
            , handler: failedApiCallHandler
        }
    ])
}