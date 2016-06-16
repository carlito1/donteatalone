angular.module('sentdevs.controllers.offersController', [])
.controller('OffersController', ['$scope', 'offersService', function ($scope, offersService) {

       $scope.myoffer = {};
       offersService.getmyOffers()
       .then(function (offer) {
            $scope.myoffer = offer;
       });
       
       $scope.mypastoffers = [];
       offersService.getmypastoffers()
       .then(function (pastoffer) {
            console.log("test",pastoffer);
            $scope.mypastoffers = pastoffer;
       });
     
}]);