/// <reference path="trendingController.js" />
angular.module('sentdevs.controllers.chatDetailController', [])
.controller('ChatDetailController', ['$scope', '$stateParams', 'principal', 'chatService', '$ionicScrollDelegate',
 function ($scope, $stateParams, principal, chatService, $ionicScrollDelegate) {
    $scope.chatId = Number( $stateParams.chatId );

    init();
    getMessages();
    $scope.$on('$ionicView.enter', function() {
        getMessages();
    });
    
    $scope.handleKeyDown = function( $event ) {
        if( $event.key === 'Enter' ) {
            $scope.sendMessage();
        }
    };
    $scope.sendMessage = function() {
        if( $scope.message === '' ) {
            return;
        }
        $scope.sending = true;
        principal.getIdentify()
        .then( function( identity ){
            var message = {
                sender: identity,
                message: $scope.message
            };
            return chatService.sendMessage( $scope.chatId, message );
        } )
        .then( function() {
            $scope.loading = false;
            $scope.message = '';
        } );
    };
    function getMessages() {
        return chatService.getMessages( $scope.chatId, function( chat ) {
            $scope.chat = chat;
            $scope.loading = false;
            $ionicScrollDelegate.$getByHandle( 'chatList' ).scrollBottom( true );
        } );
    }
    
    function init() {
        $scope.chat = [];
        $scope.sending = false;
        $scope.message = '';
        $scope.loading = true;
    }

}]);