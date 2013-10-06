/** API for sending updates to lights in connected browsers */

var state = require('../api/state');

function sendLight(id, light) {
    var socketsio = require('./socketIoContainer').io;
    socketsio.sockets.emit('state', light);
}

function sendAllLights(){
    var config = state.getConfig();

    for(var lightId in config.lights) {
        var light = state.getLight(lightId);
        if (light) {
            sendLight(lightId, light);
        }
    }
}


module.exports = {
    sendLight : sendLight
    , sendAllLights: sendAllLights
}
