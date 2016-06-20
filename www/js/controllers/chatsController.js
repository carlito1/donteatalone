/// <reference path="trendingController.js" />
angular.module('sentdevs.controllers.chatsController', [])
.controller('ChatController', ['$scope', 'chatService', '$ionicLoading', function ($scope, chatService, $ionicLoading) {
    $scope.chats = [];
     // Needed because of ng-if
    init();

    $scope.$on('$ionicView.enter', function() {
        console.log( 'To se proži' );
        init();
    });
    function arrayContains(arr, val, equals) {
        var i = arr.length;
        while (i--) {
            if ( equals(arr[i], val) ) {
                return true;
            }
        }
        return false;
    }

    function equals( a, b ) {
        return a.id === b.id;
    }
    function init() {
        $scope.chats = [];
        $ionicLoading.show( {
            template: '<ion-spinner></ion-spinner>'
        } );
        chatService.getChats( function( chat ) {
            if( !arrayContains( $scope.chats, chat, equals ) ) {
                $scope.chats.push( chat );
            }
            $scope.$digest();
            return $ionicLoading.hide();
        } );
    }
}]);