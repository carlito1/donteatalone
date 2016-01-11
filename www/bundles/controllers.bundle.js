/// <reference path="trendingController.js" />
angular.module('sentdevs.controllers.chatDetailController', [])
.controller('ChatDetailController', ['$scope', '$stateParams', function ($scope, $stateParams) {

    $scope.chat.name = 'Test';
}]);
/// <reference path="trendingController.js" />
angular.module('sentdevs.controllers.chatsController', [])
.controller('ChatController', ['$scope', function ($scope) {
    var chats = [{
        id: 0,
        name: 'Sparrow, Jolie, Electra',
        lastText: 'You on your way?',
        face: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSbXtTejz9qlDW1QXfqT1rYT5HkQQG-JNBbpbPztG--tp71jbvX1Edl_Q'
    }, { 
        id: 1,
        name: 'Payne, Duck',
        lastText: 'Hey, it\'s me',
        face: 'data:image/jpeg;base64,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'
    }];
    $scope.chats = chats;
}]);
angular.module('sentdevs.controllers.loginController', [])
.controller('LoginController', ['$scope', '$state', 'principal', function ($scope, $state, principal) {
    $scope.loginUser = function loginUser() {
        principal.logIn().then(function(){
            $state.go('loged.tab.trending');
        }, function(error){
            //error hapened
            //TODO : handle error
        });
    };
}]);
angular.module('sentdevs.controllers.navigationBarController', [])
.controller('NavigationBarController', ['$scope', '$ionicSideMenuDelegate', function ($scope, $ionicSideMenuDelegate) {
    $scope.selected = 0;
    $scope.toggleMenu = function toggleMenu() {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.select = function select(pageIndex) {
        $scope.selected = pageIndex;
    };
}]);
angular.module('sentdevs.controllers.offersCounterController', [])
.controller('offersCounterController', ['$scope', 'offersService', function ($scope, offersService) {
    $scope.counter = 0;
    
    offersService.getUnresolvedOffersCount().then(function(coutner){
        $scope.counter = coutner;
    });
}]);
angular.module('sentdevs.controllers.peopleController', [])
.controller('PeopleController', ['$scope', 'peopleService', function ($scope, peopleService) {
    //Initialization in case we don't have data;
    $scope.people = [];
    $scope.people = peopleService.getAll();
}]);
angular.module('sentdevs.controllers.trendingController', [])
.controller('TrendingController', ['$scope', 'offersService', function ($scope, offersService) {
    $scope.offers = [];
    offersService.getAll().then(function (offers) {
        $scope.offers = offers;
    }, function () {
        //Error happended. Notify user
    });
}]);
angular.module('sentdevs.controllers', ['sentdevs.controllers.chatsController',
    'sentdevs.controllers.trendingController',
    'sentdevs.controllers.peopleController',
    'sentdevs.controllers.navigationBarController',
    'sentdevs.controllers.loginController',
    'sentdevs.controllers.chatDetailController',
    'sentdevs.controllers.offersCounterController'
]);