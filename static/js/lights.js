
angular.module('huemulator', ['huemulator.notifyService', 'huemulator.hueLightState']);

angular.module('huemulator')
    .controller('LightsCtrl', ['$scope', 'hueNotifyService', 'hueLightState', function($scope, hueNotifyService, hueLightState) {
        var lights = hueLightState.lights;

        $scope.data = { lights : lights };

        hueNotifyService.initialise();

    }]);
