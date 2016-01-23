angular.module('sentdevs.directives.offerDirective', [])
.directive('sdOffer', [function () {
    return {
        templateUrl: function () {
            console.log('template url');
            return './templates/directives/offer.html';
        },
        scope: {
            offerInfo: '=offer'
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
            function notified() {
                init();
                //$scope.apply();
            }
            
            init();

            offersService.subscribe($scope.offerInfo, notified);
            $scope.toggleVisible = function toggleVisible() {
                $scope.visible = !$scope.visible;
            };
            $scope.placeOffer = function placeOffer($event) {
                $event.stopPropagation(); // needed so that event don't bubble to toggleVisible
                offersService.signForOffer($scope.offerInfo);
                
            };
        }]
    };  
}]); 