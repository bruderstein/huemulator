// TODO: The defaults shouldn't be in state, should be in ../app/defaults
var state = require('../state');

function crossProduct(pt1, pt2) {
    return (pt1.x * pt1.y - pt1.y * pt2.x);
}

function inReachOfLamps(model, cx, cy) {
    var reference = state.getLightCapabilities(model);
    if (!reference) {
        reference = state.getLightCapabilities("LCT001");  // Default to the Hue2012 bulb
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
function xyToRgb(cx, cy, brightness) {
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

/** Poor man's CT conversion.
 *
 * @param ct  Colour Temperature value (153 to 499)
 * @param bri Brightness (0.0 to 1.0)
 * @returns { r: redComponent, g: greenComponent, b: blueComponent }
 */
function ctToRgb(ct, bri) {
    var normalizedCt = (ct - 153) / 346;
    console.log('NOrmalized ct ' + normalizedCt);

    var distance, color;
    if (normalizedCt >= 0.5) {
        distance = normalizedCt - 0.5;
        color = {
            r: Math.round(255 * bri)
            , b: Math.round((255 - (distance * 64)) * bri)
            , g: Math.round((255 - (distance * 64)) * bri)
        };

    } else {
        distance = 0.5 - normalizedCt;
        color = {
            r: Math.round((255 - (distance * 64)) * bri)
            , b: Math.round(255 * bri)
            , g: Math.round((255 - (distance * 64)) * bri)
        };
    }
    return color;
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
            var rgb = xyToRgb(cx, cy, light.config.state.bri / 255.0);
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
            light.color = ctToRgb(light.config.state.ct, light.config.state.bri / 255);
            break;
    }

}


module.exports = {
    calculateColor: calculateColor
    , hsbToRgb : hsbToRgb
    , xyToRgb : xyToRgb
    , ctToRgb : ctToRgb
}