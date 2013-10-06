var state = require('./state');
var lights = require('./lights');

var remoteApiNotification = require('../app/remoteApiNotification');

function fixRequest(request) {
    request.payload = JSON.parse(request.rawPayload.toString());
}

function getGroupsHandler(request) {
    var config = state.getConfig();
    var groups = {};
    for(var group in config.groups) {
        groups[group] = { name : config.groups[group].name };
    }
    request.reply(groups);
    remoteApiNotification.notifyApiCall(request, response);
}


function getGroupAttributesHandler(request) {
    var group = state.getConfig().groups[request.params['id']];
    var response = {};
    if (group) {
        if (!group.action) {
            response.action = {};
        } else {
            response.action = group.action;
        }

        response.lights = group.lights;
        response.name = group.name;
        response.scenes = {};  // Unused, according to the docs
    }
    request.reply(response);

    remoteApiNotification.notifyApiCall(request, response);

}

function putGroupAttributesHandler(request) {
    fixRequest(request);
    var allGroups = state.getConfig().groups;
    var group = allGroups[request.params['id']];

    var response = [];
    if (group) {
        if (request.payload.name) {
            var newName = request.payload.name;

            if (!nameUnique(request.payload.name, allGroups)) {
                var appendNumber = 1;
                while(!nameUnique(newName + ' ' + appendNumber), allGroups) {
                    appendNumber++;
                }
                newName = newName + ' ' + appendNumber;
            }

            group.name = newName;
            var change = {};
            change['/groups/' + id + '/name'] = newName;
            response.push({ success: change});
        }

        if (request.payload.lights || (request.payload.lights == [])) {
            group.lights = request.payload.lights;
            var change = {};
            change['/groups/' + id + '/lights'] = groups.lights;
            response.push({success: change});
        }


    }

    request.reply(response);
    remoteApiNotification.notifyApiCall(request, response);
}


function putGroupActionHandler(request) {
    fixRequest(request);
    var config = state.getConfig();

    var group;
    if (request.params['id'] == 0) {
        group = { lights: []};
        for(var lightId in config.lights) {
            group.lights.push(lightId);
        }

    } else {
        group = config.groups[request.params['id']];
    }


    var response = [];
    if (group) {
        group.action = request.payload;

        for(var lightIndex in group.lights) {
            var lightId = group.lights[lightIndex];
            lights.setState(lightId, request.payload);
        }

        for(var key in request.payload) {
            var change = {};
            change['/groups/' + request.params['id'] + '/action/' + key] = request.payload[key];
            response.push({success: change});
        }
    }

    request.reply(response);
    remoteApiNotification.notifyApiCall(request, response);
}

function addRoutes(server) {
    server.route([
        {
            method: 'GET'
            , path: '/api/{username}/groups'
            , handler: getGroupsHandler
        }
        , {
            method: 'GET'
            , path: '/api/{username}/groups/{id}'
            , handler: getGroupAttributesHandler
        }
        , {
            method: 'PUT'
            , path: '/api/{username}/groups/{id}'
            , handler: putGroupAttributesHandler
        }
        , {
            method: 'PUT'
            , path: '/api/{username}/groups/{id}/action'
            , handler: putGroupActionHandler
        }
    ]);
}



module.exports = {
    addRoutes: addRoutes
};
