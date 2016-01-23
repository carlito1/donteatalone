angular.module('sentdevs.controllers.peopleController', [])
.controller('PeopleController', ['$scope', 'peopleService', function ($scope, peopleService) {
    //Initialization in case we don't have data;
    $scope.people = [];
    $scope.people = peopleService.getAll();
    
    $scope.friendRequest = function() {
      
      var r = Math.ceil(Math.random() * 1000);
      $scope.person
    };
    
}]);