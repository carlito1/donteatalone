/// <reference path="trendingController.js" />
angular.module('sentdevs.controllers.chatDetailController', [])
.controller('ChatDetailController', ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.chat = {};
    $scope.chat.name = 'Test';
}]);