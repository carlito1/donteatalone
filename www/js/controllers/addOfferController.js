angular.module('sentdevs.controllers.addOffer', [])
.controller('AddOfferController', ['$scope', '$state', 'offersService',  function($scope, $state, offersService){
    $scope.offer = {};
    $scope.offer.eaters = [];
    
    $scope.createOffer = function() {
        console.log($scope.offer);
        offersService.createOffer($scope.offer).then(function(bStatus) {
            console.log('Totrata', bStatus);
            $state.go('loged.tab.trending');
        });
    };
}]);