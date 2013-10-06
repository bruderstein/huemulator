/** Lights api
 *  /api/{username}/lights/....
 */

var state = require('./state');
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

var modelCapability = {
    "LCT001" : {
        red : { x : 0.675,  y: 0.322 }
        , green : { x : 0.4091, y : 0.518}
        , blue : { x: 0.167, y : 0.04 }
    }
}

function crossProduct(pt1, pt2) {
    return (pt1.x * pt1.y - pt1.y * pt2.x);
}

function inReachOfLamps(model, cx, cy) {
    var reference = modelCapability[model];
    if (!reference) {
        reference = modelCapability["LCT001"];  // Default to the Hue2012 bulb
    }

    var v1 = {
            x: reference.green.x - reference.red.x
            , y: reference.green.y - reference.red.y
    };

    var v2 = {
        x: reference.blue.x - reference.red.x
        , y: reference.blue.y - reference.red.y
    };

    var q = {
        x: cx - reference.red.x
        , y: cy - reference.red.y
    }

    var s = crossProduct(q, v2) / crossProduct(v1, v2);
    var t = crossProduct(v1, q) / crossProduct(v1, v2);

    if (s >= 0 && t >= 0 && s+t <= 1.0) {
        return true;
    }
    return false;

}

// Note: This function doesn't seem to work at the moment.
// Posted a question to the forum based on the weird results returned
// http://www.everyhue.com/vanilla/discussion/1192/issue-with-xy-to-rgb-conversion
function XyToRgb(cx, cy, brightness) {
    var x = cx;
    var y = cy;
    var z = 1.0 - x - y;

    var pY = brightness;
    var pX = (pY / y) * x;
    var pZ = (pY / y) * z;

    var r = pX  * 3.2410 - pY * 1.5374 - pZ * 0.4986;
    var g = -pX * 0.9692 + pY * 1.8760 + pZ * 0.0416;
    var b = pX  * 0.0556 - pY * 0.2040 + pZ * 1.0570;

    var result = {
        r : Math.round(255 * (r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055))
        , g : Math.round(255 * (g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055))
        , b : Math.round(255 * (b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055))
    };


    return result;
}

// From http://www.easyrgb.com/index.php?X=MATH&H=19#text19
function hsbToRgb(hsb) {
    var var_2;
    if ( hsb.bri < 0.5 ) {
        var_2 = hsb.bri * ( 1 + hsb.sat )
    }
    else           {
        var_2 = ( hsb.bri + hsb.sat ) - ( hsb.sat * hsb.bri );
    }

    var var_1 = 2 * hsb.bri - var_2;

    return {
        r : Math.round(255 * hueToRgb( var_1, var_2, hsb.hue + ( 1.0 / 3 ) ))
        , g : Math.round(255 * hueToRgb( var_1, var_2, hsb.hue ))
        , b : Math.round(255 * hueToRgb( var_1, var_2, hsb.hue - ( 1.0 / 3 ) ))
    };
}


function hueToRgb(v1, v2, vH) {
    if ( vH < 0 ) {
        vH += 1;
    }
    if ( vH > 1 ) {
        vH -= 1;
    }
    if ( ( 6 * vH ) < 1 ) {
        return ( v1 + ( v2 - v1 ) * 6 * vH );
    }

    if ( ( 2 * vH ) < 1 ) {
        return ( v2 );
    }

    if ( ( 3 * vH ) < 2 ) {
        return ( v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6 );
    }

    return ( v1 );
}

/** Uses the mode of the light in order to set the light.color attribute
 *
 * @param light The light record from the state
 */
function calculateColor(light) {
    switch(light.config.state.colormode) {
        case 'xy':
            var cx = light.config.state.xy[0];
            var cy = light.config.state.xy[1];
            if (!inReachOfLamps(light.model, cx, cy)) {

            }

            // TODO: Patch the brightess to 0.1 < x < 1.0, as brightness 0 is not off
            // We can't do this yet, as the XY conversion is, ahem, less-than-perfect.  A simple patching of the range
            // from 0-100% to 10% to 100% results in a very abrupt "off" at the bottom end of the range. I suspect
            // that's down to the dodgy conversion from XY. When that's fixed, we can patch the brightness
            var rgb = XyToRgb(cx, cy, light.config.state.bri / 255.0);
            light.color = rgb;
            break;

        case 'hs':
            var hsb = {
                hue: light.config.state.hue / 65535.0
                , sat : light.config.state.sat / 255
                , bri : light.config.state.bri / 255
            };
            light.color = hsbToRgb(hsb); // hslToRgb(hsb.hue, hsb.sat, hsb.bri);

            break;


        case 'ct':
            // Poor man's CT conversion.
            var ct = light.config.state.ct;
            var normalizedCt = (ct - 153) / 346;
            console.log('NOrmalized ct ' + normalizedCt);

            var distance, color;
            if (normalizedCt >= 0.5) {
                distance = normalizedCt - 0.5;
                color = {
                    r: 255
                    , b: Math.round(255 - (distance * 64))
                    , g: Math.round(255 - (distance * 64))
                };

            } else {
                distance = 0.5 - normalizedCt;
                color = {
                    r: Math.round(255 - (distance * 64))
                    , b: 255
                    , g: Math.round(255 - (distance * 64))
                };
            }
            light.color = color;

            break;
    }

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

        calculateColor(light);
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


    calculateColor(light);

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