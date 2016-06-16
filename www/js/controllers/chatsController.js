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
    function init() {
        $ionicLoading.show( {
            template: '<ion-spinner></ion-spinner>'
        } );
        chatService.getChats()
        .then( function( aChats ) {
            aChats.forEach( function (chat) {
                var lastMessage = chat.messages.slice( -1 ).pop();
                chat.avatar = lastMessage.sender.avatar;
                chat.lastText = lastMessage.message;
            } )
            $scope.chats = aChats;
            return $ionicLoading.hide();
        } );
    }
}]);