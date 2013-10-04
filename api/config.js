var state = require('./state');
var remoteApiNotification = require('../app/remoteApiNotification');

function getFullStateHandler(request) {
    // Automatically add the user in for now.
    state.whitelist[request.params['username']] = {
            'last user date' : new Date().toISOString()
            , 'create data' : new Date().toISOString()
            , name : 'android'
    };
    var response = {};
    response.lights = {};
    for(var lightId in state.lights) {
        var light = state.lights[lightId];

        response.lights[lightId] = { 'state' : {
            on : light.on
            , bri : light.bri
            , hue : light.hue
            , sat : light.sat
            , xy : [0.000, 0.000]
            , ct : 0
            , alert : 'none'
            , effect : 'none'
            , colormode : 'hs'
            , reachable : true
        }
            , type : 'Extended color light'
            , name : light.name
            , modelid : light.model
            , swversion : '65003148'   // I don't know, copied from example
            , pointsymbol : {
                1 : 'none'
                , 2 : 'none'
                , 3 : 'none'
                , 4 : 'none'
                , 5 : 'none'
                , 6 : 'none'
                , 7 : 'none'
                , 8 : 'none'

            }
        };

    }

    response.groups = {};
    response.config = {
        name : 'Philips hue'
        , mac: '00:24:1d:0e:e9:2f'  // Might be able to get this from node, somehow
        , dhcp : true
        , ipaddress : '192.168.8.7' //request.raw.req.localAddress
        , netmask : "255.255.255.0"   // I'm guessing. Prob need to look the address up from require('os).networkInterfaces()
        , gateway : "192.168.8.1"   // how should I know, and more to the point, why do you want to know?
        , proxyaddress : ''
        , proxyport : 0
        , UTC : new Date().toISOString()
        , whitelist : state.whitelist
        , swversion : '01003372'   // From the example
        , swupdate: {
            updatestate: 0
            , url : ''
            , text : ''
            , notify : false
        }
        , linkbutton: state.linkbutton
        , portalservice: false
        , schedules : {}  // At the moment, no schedules supported
        }

    request.reply(response);
    remoteApiNotification.notifyApiCall(request, response);
}


module.exports = {

    addRoutes : function(server) {
        server.route([
            {
                method : 'GET'
                , path : '/api/{username}'
                , handler : getFullStateHandler
            }
        ])
    }
}