
angular.module('huemulator', ['huemulator.notifyService', 'huemulator.hueLightState', 'huemulator.hueCalls']);

angular.module('huemulator')
    .controller('LightsCtrl', ['$scope', 'hueNotifyService', 'hueLightState', 'hueCalls', function($scope, hueNotifyService, hueLightState, hueCalls) {

        var lights = hueLightState.lights;

        $scope.data = { lights : lights, calls : hueCalls.calls };

        $scope.selectApiCall = function(index) {
            if ($scope.data.selectedApiCall != null) {
                $scope.data.calls[$scope.data.selectedApiCall].selected = false;
            }
            $scope.data.calls[index].selected = true;
            $scope.data.selectedApiCall = index;
            $scope.data.selectedCallDetails = $scope.data.calls[index];

        }
        hueNotifyService.initialise();

    }]);
