

exports.notifyApiCall = function(request, response) {
    var socketsio = require('./socketIoContainer').io;
    socketsio.sockets.emit('apicall', {
        path: request.path
        , method : request.method
        , payload : request.payload
        , response : response
    });

}


exports.notifyFailedApiCall = function(request, response) {
    var socketsio = require('./socketIoContainer').io;
    socketsio.sockets.emit('apicall', {
        path: request.path
        , method : request.method
        , payload : request.payload
        , failed : true
        , response : response
    });

}
