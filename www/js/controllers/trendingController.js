angular.module('sentdevs.controllers.trendingController', [])
.controller('TrendingController',
         ['$scope',
          'offersService',
          '$ionicLoading',
          function ($scope, offersService, $ionicLoading) {
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