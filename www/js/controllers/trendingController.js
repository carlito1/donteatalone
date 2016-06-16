angular.module('sentdevs.controllers.trendingController', [])
.controller('TrendingController',
         ['$scope',
          'offersService',
          '$ionicLoading',
          function ($scope, offersService, $ionicLoading) {
    $scope.offers = [];
    getOffers();
    
    function getOffers() {
        $ionicLoading.show( {
            template: '<ion-spinner></ion-spinner>'
        } );
        return offersService.getAll()
        .then(function (offers) {
            $scope.offers = offers;
        }, function () {
            //Error happended. Notify user
        })
        .finally( function() {
            $ionicLoading.hide();
        } );
    }
    $scope.placeOffer = function( offer ) {
        offersService.signForOffer( offer )
        .then( function(){ 
            return getOffers();
        });
    };
}]);