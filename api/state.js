/** Contains the state of all the lights, and in-the-future, the schedules
 * @module state
 */
var ipaddress = require('./utility/ipaddress');
var ip = ipaddress.getIpAddress();




/** Contains the current state of the config
 * @type {Object}
 */


var config = {
        lights :
        {
            /*'1' : {
                'state' : {
                    on : false
                    , bri : 0
                    , hue : 0
                    , sat : 0
                    , xy : [0.000, 0.000]
                    , ct : 0
                    , alert : 'none'
                    , effect : 'none'
                    , colormode : 'hs'
                    , reachable : true
                }
                , type : 'Extended color light'
                , name : 'Light 1'
                , modelid : 'LCT001'
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
            }
            , '2' : {
                'state' : {
                    on : false
                    , bri : 0
                    , hue : 0
                    , sat : 0
                    , xy : [0.000, 0.000]
                    , ct : 0
                    , alert : 'none'
                    , effect : 'none'
                    , colormode : 'hs'
                    , reachable : true
                }
                , type : 'Extended color light'
                , name : 'Light 2'
                , modelid : 'LCT001'
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
            }
            , '3' : {
                'state' : {
                    on : false
                    , bri : 0
                    , hue : 0
                    , sat : 0
                    , xy : [0.000, 0.000]
                    , ct : 0
                    , alert : 'none'
                    , effect : 'none'
                    , colormode : 'hs'
                    , reachable : true
                }
                , type : 'Extended color light'
                , name : 'Light 3'
                , modelid : 'LCT001'
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
            } */
        }
    , groups : {}
    , config : {
        name : 'Philips hue'
        , mac: ipaddress.getMacAddress(ip)
        , dhcp : true  // Assume true
        , ipaddress : ip
        , netmask : "255.255.255.0"   // guessing.  Hopefully it shouldn't matter to any caller
        , gateway : "127.0.0.1"   // how should I know, and more to the point, why do you want to know?
        , proxyaddress : ''
        , proxyport : 0
        , UTC : new Date().toISOString().substr(0, 19)
        , whitelist : {
            'newdeveloper' : {
                'last user date' : new Date().toISOString().substr(0, 19)
                , 'create data' : new Date().toISOString().substr(0, 19)
                , name : 'auto generated developer'
            }
        }
        , swversion : '01003372'   // From the example
        , swupdate: {
            updatestate: 0
            , url : ''
            , text : ''
            , notify : false
        }
        , linkbutton: false
        , portalservices: false
        }
};


var lights = {
    '1' :  {
        id : 1
        , color : { r: 0, g: 0, b: 0}
        , config : config.lights['1']
    }
    ,'2' :  {
        id: 2
        , color: { r: 0, g: 0, b: 0}
        , config : config.lights['2']
    }
    ,'3' :  {
        id: 3
        , color: { r: 0, g: 0, b: 0}
        , config : config.lights['3']
    }

};


var lightDefaults = {
    'LCT001' : {
        capability: {
            red : { x : 0.675,  y: 0.322 }
            , green : { x : 0.4091, y : 0.518}
            , blue : { x: 0.167, y : 0.04 }
        }
        , defaults : {
                'state' : {
                    on : true
                    , bri : 254
                    , hue : 0
                    , sat : 255
                    , xy : [0.3142, 0.331]
                    , ct : 0
                    , alert : 'none'
                    , effect : 'none'
                    , colormode : 'xy'
                    , reachable : true
                }
                , type : 'Extended color light'
                , name : 'Light'
                , modelid : 'LCT001'
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
            }
    }
}


exports.getConfig = function() {
    config.config.UTC = new Date().toISOString().substr(0, 19);
    return config;
}

exports.getLight = function(id) {
    return lights[id];
}

exports.getLightCapabilities = function(model) {
    var defaults = lightDefaults[model];
    if (defaults) {
        return defaults.capability;
    }
    return undefined;
}

exports.addLight = function(id) {
    lights[id] = {
        id: id
        , color: { r: 255, g: 255, b: 255}
        , config: config.lights[id]
    };
}

function clone(o) {
    var result = undefined;
    switch(typeof(o)) {
        case 'object':
            if (o === null) {
                result = null;
            }
            else if (Array.isArray(o)) {
                result = [];
                for(key in o) {
                    result[key] = clone(o[key]);
                }
            }
            else {
                result = {}
                for(var key in o) {
                    result[key] = clone(o[key]);
                }
            }
            break;

        case 'undefined':
            break;

        default:
            result = o;
            break;
    }
    return result;
}

exports.getLightDefaults = function(model) {
    var lightSpec = lightDefaults[model];
    if (lightSpec) {
        var newLight = clone(lightSpec.defaults);
        return newLight;
    } else {
        return undefined;
    }
}

// Default to port 80
exports.port = 80;
