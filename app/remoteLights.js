/** API for sending updates to lights in connected browsers */


exports.sendLight = function(id, light) {
    var socketsio = require('./socketIoContainer').io;
    socketsio.sockets.emit('state', light);
}


