angular.module('sentdevs.directives.offerDirective', [])
.directive('sdOffer', [function () {
    return {
        templateUrl: function () {
            console.log('template url');
            return './templates/directives/offer.html';
        },
        scope: {
            offerInfo: '=offer',
            placeOffer: '&'
        },
        restrict: 'E',  
        controller: ['$scope', 'offersService', function ($scope, offersService) {
            $scope.visible = false;
            function init() {
                $scope.range = [];
                for (var i = 0; i < $scope.offerInfo.numOfPersons - $scope.offerInfo.eaters.length; i++) {
                    $scope.range.push('');
                }
            }
            offersService.subscribe( $scope.offerInfo, function( offer ) {
                $scope.offerInfo = offer;
                init();
            } );

            init();
            $scope.toggleVisible = function toggleVisible() {
                $scope.visible = !$scope.visible;
            };
        }]
    };  
}]); 