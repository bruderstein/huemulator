//setup Dependencies
var hapi = require('hapi');
var socketIO = require('socket.io');
var remoteLights = require('./app/remoteLights')
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
    var io = socketIO.listen(server.listener);

    remoteLights.initialise(io);

    io.sockets.on('connection', function(socket){
        console.log('Client Connected');
        socket.on('message', function(data){
            socket.broadcast.emit('server_message',data);
            socket.emit('server_message',data);
        });
        socket.on('disconnect', function(){
            console.log('Client Disconnected.');
        });
    });
})

console.log('Listening on http://0.0.0.0:' + port );
