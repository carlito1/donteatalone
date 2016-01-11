angular.module('sentdevs.controllers.trendingController', [])
.controller('TrendingController', ['$scope', 'offersService', function ($scope, offersService) {
    $scope.offers = [];
    offersService.getAll().then(function (offers) {
        $scope.offers = offers;
    }, function () {
        //Error happended. Notify user
    });
}]);