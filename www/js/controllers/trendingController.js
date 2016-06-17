angular.module('sentdevs.controllers.trendingController', [])
.controller('TrendingController',
         ['$scope',
          'offersService',
          function ($scope, offersService) {
    $scope.offers = [];
    getOffers();
    
    function getOffers() {
        $scope.offers = offersService.getAll();
    }
    $scope.placeOffer = function( offer ) {
        offer.canEdit = false;
        offersService.signForOffer( offer );
    };
}]);