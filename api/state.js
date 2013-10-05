/** Contains the state of all the lights, and in-the-future, the schedules
 * @module state
 */


/** Contains the state of all the lights
 * @type {Array}
 */

exports.lights = {
    1 :
    {
        id : 1
        , name : 'hallway'
        , hue : 46920
        , bri : 255
        , sat : 255
        , on : true
        , model : 'LCT001'
        , color : { r: 255, g: 255, b: 255 }
    }
    , 2 : {
        id : 2
        , name : 'lounge'
        , hue : 56100
        , bri : 255
        , sat : 255
        , on : true
        , model : 'LCT001'
        , color : { r: 255, g: 255, b: 255 }
    }

};


exports.whitelist = {
    "test" : {
        'last user date' : new Date().toISOString().substr(0,19)
        , 'create data' : new Date().toISOString().substr(0,19)
        , name : 'test user'
    }
};

// State of the link button to allow connecting
exports.linkbutton = false;

