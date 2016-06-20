/// <reference path="trendingController.js" />
angular.module('sentdevs.controllers.chatDetailController', [])
.controller('ChatDetailController', ['$scope', '$stateParams', 'principal', 'chatService', '$ionicScrollDelegate',
 function ($scope, $stateParams, principal, chatService, $ionicScrollDelegate) {
    $scope.chatId = $stateParams.chatId;

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
                message: $scope.message,
                timestamp: Date.now()
            };
            return chatService.sendMessage( $scope.chatId, message );
        } )
        .then( function() {
            $scope.sending = false;
            $scope.message = '';
        } );
    };

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
    function getMessages() {
        return chatService.getMessages( $scope.chatId, function( chat ) {
            if( !arrayContains( $scope.messages, chat, equals ) ) {
                $scope.messages.push( chat );
            }
            $scope.$digest();
            $ionicScrollDelegate.$getByHandle( 'chatList' ).scrollBottom( true );
        } );
    }
    
    function init() {
        $scope.messages = [];
        $scope.sending = false;
        $scope.message = '';
        $scope.loading = true;
    }

}]);