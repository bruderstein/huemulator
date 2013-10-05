var state = require('./state');
var remoteApiNotification = require('../app/remoteApiNotification');

function getFullStateHandler(request) {
    // Automatically add the user in for now.
    var config = state.getConfig();
    config.config.whitelist[request.params['username']] = {
            'last user date' : new Date().toISOString().substr(0, 19)
            , 'create data' : new Date().toISOString().substr(0, 19)
            , name : 'android'
    };
   /*
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

    response.groups = {
        1 : {
            action : {
                on : true
                , bri: 254
                , hue: 33536
                , sat: 144
                , xy: [0.346, 0.3568]
                , ct: 201
                , effect: "none"
                , colormode: "xy"
            }
            , lights: ["1", "2"]
            , name: "Group 1"
        }};
    response.config = {
        name : 'Philips hue'
        , mac: '00:00:88:00:bb:ee'  // Might be able to get this from node, somehow
        , dhcp : true
        , ipaddress : '192.168.8.10' //request.raw.req.localAddress
        , netmask : "255.255.255.0"   // I'm guessing. Prob need to look the address up from require('os).networkInterfaces()
        , gateway : "192.168.8.1"   // how should I know, and more to the point, why do you want to know?
        , proxyaddress : ''
        , proxyport : 0
        , UTC : new Date().toISOString().substr(0, 19)
        , whitelist : state.whitelist
        , swversion : '01003372'   // From the example
        , swupdate: {
            updatestate: 0
            , url : ''
            , text : ''
            , notify : false
        }
        , linkbutton: state.linkbutton
        , portalservices: false
        };
    response.schedules = {
        "1": {
            "name": "schedule",
                "description": "",
                "command": {
                "address": "\/api\/0\/groups\/0\/action",
                    "body": {
                    "on": true
                },
                "method": "PUT"
            },
            "time": "2012-10-29T12:00:00"
        }
    };
*/
    request.reply(config)
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Methos', 'GET, PUT, POST, DELETE, OPTIONS')
        .header('Access-Control-Allow-Headers', 'Content-Type')
        .header('Content-Type', 'application/json; charset=UTF-8')
        .header('content-encoding', 'identity');

    remoteApiNotification.notifyApiCall(request, config);
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