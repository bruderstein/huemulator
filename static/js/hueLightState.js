
angular.module('huemulator.hueLightState', [])
    .factory('hueLightState', function() {
       return  {
           'lights': {
               "1" : {
                   id : 1
                   , name : 'hallway'
                   , color : 'rgba(0,0,0,0)'
               }
               , "2" : {
                   id : 2
                   , name : 'lounge'
                   , color : 'rgba(0,0,0,0)'
               }
               , "3" : {
                   id : 3
                   , name : 'bedroom'
                   , color : 'rgba(0,0,0,0)'
               }
           }
    };
    });