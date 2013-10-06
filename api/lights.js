/** Lights api
 *  /api/{username}/lights/....
 */

var state = require('./state');
var color = require('./utility/color');
var remoteLights = require('../app/remoteLights');
var remoteApiNotification = require('../app/remoteApiNotification');

/*   Much of the colour handling is taken from https://github.com/PhilipsHue/PhilipsHueSDKiOS/blob/master/ApplicationDesignNotes/RGB%20to%20xy%20Color%20conversion.md
 *   (master at xxxxxx)
 */

//  /api/{username}/lights
function getLightsHandler(request) {
    var returnState = {};
    for(var lightId in state.lights) {
      returnState[lightId] = { name : state.lights[lightId].name };
    }

    request.reply(returnState);

    remoteApiNotification.notifyApiCall(request, returnState);
}



function fixRequest(request) {
    request.payload = JSON.parse(request.rawPayload.toString());
}

function setState(lightId, newState) {
    var light = state.getLight(lightId);
    if (light) {
        if (newState.on != undefined) {
            light.config.state.on = newState.on;
        }

        if (newState.bri != undefined) {
            light.config.state.bri = newState.bri;
        }
        if (newState.hue != undefined) {
            light.config.state.hue = newState.hue;
        }
        if (newState.sat != undefined) {
            light.config.state.sat = newState.sat;
        }
        if (newState.xy != undefined) {
            light.config.state.xy = newState.xy;
        }
        if (newState.ct != undefined) {
            light.config.state.ct = newState.ct;
        }
        if (newState.alert != undefined) {
            light.config.state.alert = newState.alert;
        }
        if (newState.effect != undefined) {
            light.config.state.effect = newState.effect;
        }

        color.calculateColor(light);
        remoteLights.sendLight(lightId, light);
    }
}


function setLightStateHandler(request) {
    fixRequest(request);

    var id = request.params['id'];
    var light = state.getLight(id);
    var response = [];


    console.log(request.payload);
    if (request.payload.on == true) {
        light.config.state.on = true;
        var change = {};
        change["/lights/" + id + "/on"] = true;
        response.push({ "success": change });
    } else if (request.payload.on !== undefined && request.payload.on == false) {
       light.config.state.on = false;
        var change = {};
        change["/lights/" + id + "/on"] = false;
        response.push({ "success": change });
    }

    if (request.payload.bri) {
        light.config.state.bri = request.payload.bri;
        var change = {};
        change["/lights/" + id + "/bri"] = request.payload.bri;
        response.push({ "success": change });
    }


    if (request.payload.xy) {

        var cx = request.payload.xy[0];
        var cy = request.payload.xy[1];

        light.config.state.xy = [cx, cy];
        light.config.state.colormode = 'xy';

        var change = {};
        change["/lights/" + id + "/xy"] = request.payload.xy;
        response.push({ "success": change });
    }

    if (request.payload.hue) {
        light.config.state.hue = request.payload.hue;
        light.config.state.colormode = 'hs';
        var change = {};
        change["/lights/" + id + "/hue"] = request.payload.hue;
        response.push({ "success": change });
    }

    if (request.payload.sat) {
        light.config.state.sat = request.payload.sat;
        light.config.state.colormode = 'hs';
        var change = {};
        change["/lights/" + id + "/sat"] = request.payload.sat;
        response.push({ "success": change });
    }

    if (request.payload.ct) {
        light.config.state.ct = request.payload.ct;
        light.config.state.colormode = 'ct';
        var change = {};
        change["/lights/" + id + "/ct"] = request.payload.ct;
        response.push({ "success": change });

    }


    color.calculateColor(light);

    console.log('Updating light ' + light.id);
    console.log(light.color);
    remoteLights.sendLight(light.id, light);

    request.reply(response);
    remoteApiNotification.notifyApiCall(request, response);
}

function setLightNameHandler(request) {
    fixRequest(request);

    var response = [];
    if (request.payload.name) {
        var id = request.params['id'];
        var light = state.getLight(id);
        var change = {};
        change['/lights/' + id + '/name'] = request.payload.name;
        if (light) {
            light.config.name = request.payload.name;
            response.push({'success' : change});
        }
    }
    request.reply(response);
    remoteApiNotification.notifyApiCall(request, response);
    remoteLights.sendLight(light.id, light);
}

module.exports = {

    setState : setState
    , addRoutes : function(server) {
        server.route([
            {
                method : 'GET'
                , path : '/api/{username}/lights'
                , handler : getLightsHandler
            }
            , {
                method : 'PUT'
                , path : '/api/{username}/lights/{id}/state'
                , config : {
                    handler : setLightStateHandler
                }
            }
            , {
                method: 'PUT'
                , path : '/api/{username}/lights/{id}/name'
                , config: {
                    handler : setLightNameHandler
                }
            }
        ])
    }
}