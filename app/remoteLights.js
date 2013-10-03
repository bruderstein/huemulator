/** API for sending updates to lights in connected browsers */

var socketsio = null;

exports.initialise = function(io) {
   socketsio = io;
}

exports.sendLight = function(id, light) {
    socketsio.sockets.emit('state', light);
}


exports.addRequest = function(request) {
    socketsio.sockets.emit('request', request);
}