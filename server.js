var hapi = require('hapi');

var socketIO = require('socket.io');
var socketIoContainer = require('./app/socketIoContainer')
var generalRoutes = require('./app/routes');
var apiRoutes = require('./api/routes');
var remoteLights = require('./app/remoteLights');
var webApi = require('./webapi/control');
var state = require('./api/state');
var discovery = require('./api/discovery');

if (process.argv.length > 2) {
    state.port =  parseInt(process.argv[2]);
} else {
    state.port = 80;
}


var server = new hapi.createServer('0.0.0.0', state.port, {
    files : {
        'relativeTo' : 'routes'
    }
});

apiRoutes.addRoutes(server);
generalRoutes.addRoutes(server);

discovery.enableDiscovery();

// Add the initial 3 lights
webApi.addLight({model : 'LCT001'});
webApi.addLight({model : 'LCT001'});
webApi.addLight({model : 'LCT001'});


server.start(function () {

    var io = socketIO.listen(server.listener, { log: false});

    socketIoContainer.io = io;

    io.sockets.on('connection', function(socket){
        console.log('Client Connected');
        remoteLights.sendAllLights();
    });
})

console.log('Listening on http://0.0.0.0:' + state.port );
