angular.module('sentdevs.controllers.offersCounterController', [])
.controller('OffersCounterController', ['$scope', 'offersService', function ($scope, offersService) {
        $scope.counter = 0;
    
        offersService.getUnresolvedOffersCount().then(function(coutner){
        $scope.counter = coutner;
    });
}]);