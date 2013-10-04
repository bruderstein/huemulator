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
    console.log({ r: r, g: g, b:b});

    var result = {
        r : r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055
        , g : g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055
        , b : b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055
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

function setLightStateHandler(request) {
    var id = request.params['id'];
    var light = state.lights[id];
    var response = [];

    if (request.payload.on === 'true') {
        light.on = true;
        var change = {};
        change["/lights/" + id + "/on"] = true;
        response.push({ "success": change });
    } else if (request.payload.on === 'false') {
       light.on = false;
        var change = {};
        change["/lights/" + id + "/on"] = false;
        response.push({ "success": change });
    }

    if (request.payload.xy) {
        var cx = request.payload.xy[0];
        var cy = request.payload.xy[1];

        var brightness = request.payload.bri;
        if (brightness === undefined) {
            brightness = light.bri ;
        }

        if (!inReachOfLamps(light.model, cx, cy)) {

        }

        var rgb = XyToRgb(cx, cy, brightness / 255.0);
        light.color = rgb;

        var change = {};
        change["/lights/" + id + "/xy"] = [cx, cy];
        response.push({ "success": change });
    }

    var hsb = {};
    var hasNewHsb = false;
    if (request.payload.hue) {
        hsb.hue = request.payload.hue / 65535.0;
        hasNewHsb = true;
        var change = {};
        change["/lights/" + id + "/hue"] = hsb.hue;
        response.push({ "success": change });
    }

    if (request.payload.sat) {
        hsb.sat = request.payload.sat / 255.0;
        hasNewHsb = true;
        var change = {};
        change["/lights/" + id + "/sat"] = hsb.sat;
        response.push({ "success": change });
    }

    if (request.payload.bri) {
        hsb.bri = request.payload.bri / 255.0;
        hasNewHsb = true;
        var change = {};
        change["/lights/" + id + "/bri"] = hsb.bri;
        response.push({ "success": change });
    }

    if (hasNewHsb) {
        hsb = {
            hue: hsb.hue || light.hue / 65535.0
           , sat : hsb.sat || light.sat / 255
           , bri : hsb.bri || light.bri / 255
        };
        console.log('Converting hsb');
        console.log(hsb);
        light.color = hsbToRgb(hsb); // hslToRgb(hsb.hue, hsb.sat, hsb.bri);
    }
    remoteLights.sendLight(light.id, light);

    request.reply(response);
    remoteApiNotification.notifyApiCall(request, response);
}


module.exports = {

    addRoutes : function(server) {
        server.route([
            {
                method : 'GET'
                , path : '/api/{username}/lights'
                , handler : getLightsHandler
            }
            , {
                method : 'PUT'
                , path : '/api/{username}/lights/{id}'
                , config : {
                    handler : setLightStateHandler
                    , payload : 'parse'
                }
            }
        ])
    }
}