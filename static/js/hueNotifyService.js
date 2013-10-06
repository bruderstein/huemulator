
angular.module('huemulator.notifyService', ['huemulator.hueLightState', 'huemulator.hueCalls'])
    .factory('hueNotifyService', ['hueLightState', '$rootScope', 'hueCalls', function(hueLightState, $rootScope, hueCalls) {

        function hsbToRgb(hsb) {

            function hueToRgb(v1, v2, vH)
            {
                if ( vH < 0 ) vH += 1;
                if ( vH > 1 ) vH -= 1;
                if ( ( 6 * vH ) < 1 ) return ( v1 + ( v2 - v1 ) * 6 * vH );
                if ( ( 2 * vH ) < 1 ) return ( v2 );
                if ( ( 3 * vH ) < 2 ) return ( v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6 );
                return v1;
            }

            var result = {};

            var var_1, var_2;

            if ( hsb.S == 0 )                       //HSL from 0 to 1
            {
                result.R = hsb.B * 255;                     //RGB results from 0 to 255
                result.G = hsb.B * 255;
                result.B = hsb.B * 255;
            }
            else
            {

                if ( hsb.B < 0.5 ) {
                    var_2 = hsb.B * ( 1 + hsb.S );
                }
                else {
                    var_2 = ( hsb.B + hsb.S ) - ( hsb.S * hsb.B );
                }

                var_1 = 2 * hsb.B - var_2;

                result.R = Math.round(255 * hueToRgb( var_1, var_2, hsb.H + ( 1 / 3 ) ));
                result.G = Math.round(255 * hueToRgb( var_1, var_2, hsb.H ));
                result.B = Math.round(255 * hueToRgb( var_1, var_2, hsb.H - ( 1 / 3 ) ));
            }

            return result;
        }

        function normalizeHueColor(hue, sat, bri) {
            return {
                H : (hue / 65535.0)
                , S : (sat / 255.0)
                , B : 0.5 // (bri / 255.0)
            }

        }

        function updateState(state) {
            var currentState = hueLightState.lights[state.id];
            if (!currentState) {
                // Light didn't exist before, let's add it
                currentState = {
                    name: state.config.name
                    , color: '#000000'
                };
                hueLightState.lights[state.id] = currentState;
            }

            $rootScope.$apply(function() {
                if (state.config.state.on) {
                    currentState.color = 'rgb(' + state.color.r + ',' + state.color.g + ',' + state.color.b + ')';

                } else {
                    currentState.color = 'rgba(0,0,0,0)';
                }
            });
        }

        function appendApiCall(data) {
            $rootScope.$apply(function() {
                hueCalls.calls.push(data);
            });
        }

        return {
            initialise : function() {
                var socket = io.connect();
                socket.on('state', function(data){
                    updateState(data);
                });

                socket.on('apicall', function(data) {
                    appendApiCall(data);
                });

            }
        }
    }]);
