var state = require('../api/state');
var remoteLights = require('../app/remoteLights');

/**
 * Adds a light, using the given arguments
 * {
 *  model: 'LCT001'
 *  , name: 'name of light'
 * }
 * @param args
 * @returns id of the new light
 */
function addLight(args) {

    var config = state.getConfig();
    var id = 0;
    for(var lightId in config.lights) {
        if (lightId > id) {
            id = lightId;
        }
    }

    // Use the next light ID
    id = parseInt(id) + 1;

    var defaults = state.getLightDefaults(args.model);
    if (!defaults) {
        defaults = state.getLightDefaults('LCT001');  // Default to LCT001
    }

    defaults.name = args.name || 'Light ' + id;
    config.lights[id] = defaults;
    state.addLight(id);

    return id;
}

/**
 * /webapi/lights/{id}
 * Payload:
 * {
 *      model: 'LCT001'         // LCT001 is the only supported model currently
 *      name: 'name of light'   // Optional. If not defined, defaults to 'Light [id]'
 * }
 * @param request
 */
function putLightHandler(request) {
    var id = addLight(request.payload)
    // Get the combined info for the new light
    var newLight = state.getLight(id);
    remoteLights.sendLight(id, newLight);
    request.reply({success: true, id:id});

}



exports.addRoutes = function(server) {
    server.route([
        {
            method: 'PUT'
            , path: '/webapi/lights'
            , handler: putLightHandler
        }
    ]);
}


exports.addLight = addLight;