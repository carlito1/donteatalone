angular.module('sentdevs.controllers', ['sentdevs.controllers.chatsController',
    'sentdevs.controllers.trendingController',
    'sentdevs.controllers.peopleController',
    'sentdevs.controllers.navigationBarController',
    'sentdevs.controllers.loginController',
    'sentdevs.controllers.chatDetailController',
    'sentdevs.controllers.offersCounterController',
    'sentdevs.controllers.addOffer'
]);
angular.module('sentdevs.controllers.addOffer', [])
.controller('AddOfferController', ['$scope', '$state', 'offersService',  function($scope, $state, offersService){
    $scope.offer = {};
    $scope.offer.eaters = [];
    
    $scope.createOffer = function() {
        console.log($scope.offer);
        offersService.createOffer($scope.offer).then(function(bStatus) {
            $state.go('loged.tab.trending');  
        });
    };
}]);
/// <reference path="trendingController.js" />
angular.module('sentdevs.controllers.chatDetailController', [])
.controller('ChatDetailController', ['$scope', '$stateParams', 'principal', 'chatService', '$ionicScrollDelegate',
 function ($scope, $stateParams, principal, chatService, $ionicScrollDelegate) {
    $scope.chatId = Number( $stateParams.chatId );

    init();
    getMessages();

    // Live ?!
    setInterval( getMessages, 2000 );

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
            return getMessages();
        } )
        .then( function() {
            $scope.message = '';
            $scope.sending = false;
            $ionicScrollDelegate.$getByHandle( 'chatList' ).scrollBottom( true );
        } );
    };
    function getMessages() {
        return chatService.getMessages( $scope.chatId )
        .then( function( chat ) {
            $scope.chat = chat;
            $scope.loading = false;
        } );
    }
    
    function init() {
        $scope.chat = [];
        $scope.sending = false;
        $scope.message = '';
        $scope.loading = true;
    }

}]);
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
angular.module('sentdevs.controllers.loginController', [])
.controller('LoginController', ['$scope', '$state', 'principal', function ($scope, $state, principal) {
    $scope.loginUser = function loginUser() {
        principal.logIn().then(function(){
            $state.go('loged.tab.trending');
        }, function(error){
            //error hapened
            //TODO : handle error
            console.log( error );
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
.controller('OffersCounterController', ['$scope', 'offersService', function ($scope, offersService) {
    $scope.counter = 0;
    
    offersService.getUnresolvedOffersCount()
    .then(function(coutner){
        $scope.counter = coutner;
    });
}]);
angular.module('sentdevs.controllers.peopleController', [])
.controller('PeopleController', ['$scope', 'peopleService', function ($scope, peopleService) {
    //Initialization in case we don't have data;
    $scope.loadingFriends = true;
    $scope.loadingPending = true;
    $scope.loadingPeople = true;
    $scope.friends = [];
    $scope.people = [];
    $scope.pending = [];

  
    peopleService.getFriends( function( people ) {
        $scope.friends = people;
        $scope.loadingFriends = false;
    } );
    peopleService.getPending( function( pending ) {
        console.log( 'pending', pending );
        $scope.pending = pending;
        $scope.loadingPending = false;
    } );
    peopleService.getPeople( function ( people ){
        $scope.people = people;
        $scope.loadingPeople = false;
    } );
    $scope.acceptFriendRequest = function( id ) {
        peopleService.acceptFriendRequest( id )
        .then( function () {
            
        }, function( error ) {
            console.log( error );
        } );
    };

    $scope.declineFriendRequest = function( id ) {
        peopleService.declineFriendRequest( id )
        .then( function () {
            
        }, function( error ) {
            console.log( error );
        } );
    };

    $scope.addFriend = function( id ) {
        peopleService.addFriend( id )
        .then( function (  ) {
            
        }, function ( error ) {
            console.log( error );
        } );
    }
}]);
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