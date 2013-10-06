angular.module('webApi',[])
    .factory('webApi', ['$http', function($http) {

        return {
            addLight: function(request) {
                $http.put('/webapi/lights', request);
            }
        }
    }]);