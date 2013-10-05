//setup Dependencies
var hapi = require('hapi');
var socketIO = require('socket.io');
var socketIoContainer = require('./app/socketIoContainer')
var generalRoutes = require('./app/routes');
var apiRoutes = require('./api/routes');
var port = 80;
var server = new hapi.createServer('0.0.0.0 ', port, {
    files : {
        'relativeTo' : 'routes'
    }
});

apiRoutes.addRoutes(server);
generalRoutes.addRoutes(server);

server.start(function () {
    var io = socketIO.listen(server.listener, { log: false});

    socketIoContainer.io = io;

    io.sockets.on('connection', function(socket){
        console.log('Client Connected');
    });
})

console.log('Listening on http://0.0.0.0:' + port );
