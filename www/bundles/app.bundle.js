// Ionic Don't eat alone App

angular.module('sentdevs', ['ionic', 'sentdevs.controllers', 'sentdevs.services', 'sentdevs.directives', 'sentdevs.filters', 'ngAnimate', 'ngOpenFB'])

.run(['$ionicPlatform', '$openFB', function ($ionicPlatform, $openFB) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
        $openFB.init({ appId: 506316962899544 });
    });
}])

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
      .state('signin', {
          url: "/login",
          templateUrl: "templates/views/login-view.html",
          controller: 'LoginController'
      })
        .state('loged', {
            url: '/loged',
            abstract: true,
            template: '<ui-view></ui-view>',
            resolve: {
                loged: ['principal', function (principal) {
                    return principal.isUserLoged();
                }]
            }
        })
        .state('loged.chats', {
            url: '/chats',
            abstract: true,
            template: '<ion-nav-view name="chats"></ion-nav-view>'
            // resolve chats
        })
        .state('loged.chats.list', {
            url: '/list',
            views: {
                'chats' : {
                    templateUrl: 'templates/views/chat-list.html',
                    controller: 'ChatController'
                }
            }
        })
        .state('loged.chats.chat-detail', {
            url: '/details/:chatId',
            views: {
                'chats' : {
                    templateUrl: 'templates/views/chat-details.html',
                    controller: 'ChatDetailController'
                }
            }
        })
            // setup an abstract state for the tabs directive
        .state('loged.offers', {
            url: '/offers',
            abstract: true,
            template: '<ion-nav-view name="offers"></ion-nav-view>'
        })
        .state( 'loged.offers.mine', {
            url: '/',
            views: {
                'offers': {
                    templateUrl: 'templates/views/offers-view.html',
                    controller: 'OffersController'

                }
            }
        } )
        
        // setup about view
        
         .state('loged.about', {
            url: '/about',
            abstract: true,
            template: '<ion-nav-view name="about"></ion-nav-view>'
        })
        .state( 'loged.about.mine', {
            url: '/',
            views: {
                'about': {
                    templateUrl: 'templates/views/about-view.html'

                }
            }
        } )

      .state('loged.tab', {
          url: "/tab",
          abstract: true,
          templateUrl: "templates/tabs.html"
      })

    // Each tab has its own nav history stack:
    .state('loged.tab.trending', {
        url: '/trending',
        views: {
            'tab-trending': {
                templateUrl: 'templates/tab-trending.html',
                controller: 'TrendingController'
            }
        }
    })
    .state('loged.tab.addOffer', {
        url: '/addOffer',
        views: {
            'tab-trending': {
                templateUrl: 'templates/views/add-offer.html',
                controller: 'AddOfferController' 
            }
        }
    })
      .state('loged.tab.people', {
          url: '/people',
          views: {
              'tab-people': {
                  templateUrl: 'templates/tab-people.html',
                  controller: 'PeopleController'
              }
          }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

}]);

angular.module('sentdevs.controllers.addOffer', [])
.controller('AddOfferController', ['$scope', '$state', 'offersService',  function($scope, $state, offersService){
    $scope.offer = {};
    $scope.offer.eaters = [];
    
    $scope.createOffer = function() {
        $scope.offer.time = $scope.offer.setTime.getTime();
        offersService.createOffer($scope.offer)
        .then(function() {
            $state.go('loged.tab.trending');  
        } );
    };
}]);
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
        chatService.getChats( function( aChats ) {
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
angular.module('sentdevs.controllers.offersController', [])
    .controller('OffersController', ['$scope', 'offersService', '$ionicLoading', function ($scope, offersService, $ionicLoading) {

        $scope.myoffer = {};
        $scope.mypastoffers = [];
        var showLoader = function() {
            $ionicLoading.show({
                template: '<ion-spinner />'
            });
        };
        var hideLoader = function() {
            $ionicLoading.hide();
        };
        var getMyOffers = function () {
            return offersService.getmyOffers()
            .then(function (offer) {
                $scope.myoffer = offer;
                return true;
            });
        };

        getMyOffers();

        $scope.declineOffer = function (id) {
            showLoader();
            var offerId = $scope.myoffer.id;
            offersService.declineOffer(offerId, id)
            .then(function () {
                return getMyOffers();
            })
            .finnaly( function () {
                hideLoader();
            } );
        }

        $scope.acceptOffer = function (id) {
            showLoader();
            var offerId = $scope.myoffer.id;
            offersService.acceptOffer(offerId, id)
            .then(function () {
                return getMyOffers();
            })
            .then( function () {
                hideLoader();
            } );
        }

    }]);
angular.module('sentdevs.controllers.offersCounterController', [])
.controller('OffersCounterController', ['$scope', 'offersService', function ($scope, offersService) {
        $scope.counter = 0;
    

        offersService.getUnresolvedOffersCount().then(function(coutner){


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
          function ($scope, offersService) {
    $scope.offers = [];
    getOffers();
    
    function getOffers() {
        $scope.offers = offersService.getAll();
    }
    $scope.placeOffer = function( offer ) {
        offer.canEdit = false;
        offersService.signForOffer( offer );
    };
}]);
angular.module('sentdevs.controllers', ['sentdevs.controllers.chatsController',
    'sentdevs.controllers.trendingController',
    'sentdevs.controllers.peopleController',
    'sentdevs.controllers.navigationBarController',
    'sentdevs.controllers.loginController',
    'sentdevs.controllers.chatDetailController',
    'sentdevs.controllers.offersCounterController',
    'sentdevs.controllers.addOffer',
    'sentdevs.controllers.offersController'
]);
angular.module('sentdevs.directives.offerDirective', [])
.directive('sdOffer', [function () {
    return {
        templateUrl: function () {
            console.log('template url');
            return './templates/directives/offer.html';
        },
        scope: {
            offerInfo: '=offer',
            placeOffer: '&'
        },
        restrict: 'E',  
        controller: ['$scope', 'offersService', '$ionicScrollDelegate', function ($scope, offersService, $ionicScrollDelegate) {
            $scope.visible = false;
            function init() {
                $scope.range = [];
                for (var i = 0; i < $scope.offerInfo.numOfPersons - $scope.offerInfo.eaters.length; i++) {
                    $scope.range.push('');
                }
            }
            offersService.subscribe( $scope.offerInfo, function( offer ) {
                $scope.offerInfo = offer;
                init();
            } );

            init();
            $scope.toggleVisible = function toggleVisible() {
                $scope.visible = !$scope.visible;
                $ionicScrollDelegate.resize();
            };
        }]
    };  
}]); 
angular.module('sentdevs.directives', ['sentdevs.directives.offerDirective']);
angular.module('sentdevs.filters.peopleFilter', [])
.filter('people', function () {
    return function (originalArray, query) {
        originalArray = originalArray || [];
        query = query || '';
        query = query.toLowerCase();

        var filtered = [];
        angular.forEach(originalArray, function (item) {
            if ((item.hasOwnProperty("name") && typeof item.name === "string" && item.name.toLowerCase().indexOf(query) !== -1) ||
                (item.hasOwnProperty("surname") && typeof item.surname === "string" && item.surname.toLowerCase().indexOf(query) !== -1)) {
                filtered.push(item);
            } 
        });

        return filtered;
    };
});

angular.module('sentdevs.filters', ['sentdevs.filters.peopleFilter']);
angular.module('sentdevs.services.chatService', [])
.factory('chatService', ['$q', 'principal', function ($q, principal) {
    var chats = [];
    var messages = [];
    function getSender( chatSnapshot ) {
        var senderId = chatSnapshot.child( 'sender' ).val();
        var fb = firebase.database();
        return fb.ref( 'peoples/' + senderId ).once( 'value' )
        .then( function ( personSnap ) {
            var personModel = {
                avatar: personSnap.child('avatar').val(),
                name: personSnap.child('name').val(),
                id: personSnap.key
            };
            return personModel;
        } ) ;
    }
    return {
        getChats: function getChats( fnCallback ) {
  
            var fb = firebase.database();
            principal.getIdentify()
            .then( function ( identity ) {
                fb.ref( 'members/' ).orderByChild( identity.id )
                .on( 'child_added', function( snapshot ){
                    chats = [];
                    fb.ref( 'chats/' + snapshot.key ).on( 'value', function( chatSnapshot ){
                        var chatModel = {
                            id: chatSnapshot.key,
                            header: chatSnapshot.child('header').val()
                        };
                        getSender( chatSnapshot ).then( function( person ){
                            chatModel.sender = person;
                            chats.push( chatModel );
                            fnCallback( chats );
                        } );

                    } );
                } ); 
            } )
        },

        getMessages: function( id, fnCallback ) {
            messages = [];
            var fb = firebase.database();
            fb.ref( 'messages/' + id )
            .on( 'child_added', function ( messageSnapshot ) {
                console.log( 'Kličem pridobivanje spoorčila');
                var messageModel = {
                    message: messageSnapshot.child( 'message' ).val()
                };
                getSender( messageSnapshot )
                .then( function( person ){
                    messageModel.sender = person;
                    messages.push( messageModel );
                    fnCallback( messages );
                } );
            } );
        },

        sendMessage: function( id, message ) {
            message.sender = message.sender.id;

            return $q.when( firebase.database().ref( 'messages/' + id ).push( message ),
                    firebase.database().ref( 'chats/' + id + '/header' ).set( message.message ),
                    firebase.database().ref( 'chats/' + id + '/lastMessage' ).set( message.sender ) );
        }
    };
}]);
angular.module('sentdevs.services.dataService', [])
.factory('dataService', ['$http', '$q', 'principal', '$ionicScrollDelegate',
     function ($http, $q, principal, $ionicScrollDelegate) {
    var eStatus = {
        FRIEND : 0,
        WAITING : 1,
        NOT_FRIEND: 2
    };
    var offerAddedSubscribers = [];
    var offersChangesSubscribers = {};
    var chatSubscribers = {};
    var offers = [];
     function onOfferAdded() {
         offerAddedSubscribers.forEach(function(fnCallback){
             fnCallback();
         });
     }
    return {
        getPeople: function ( fnCallback ) {
            firebase.database().ref( '/peoples' ).on( 
            'value', 
            function( personsSnapshot ) {
                principal.getIdentify()
                .then( function ( identity ) {
                    var aPeople = [];
                    personsSnapshot.forEach( function( personSnapshot ){
                        var personModel = {
                            name: personSnapshot.child( 'name' ).val(),
                            avatar: personSnapshot.child( 'avatar' ).val(),
                            id: personSnapshot.key
                        }
                        if( identity.id !== personModel.id ) {
                            aPeople.push( personModel ); // Filter self
                        }
                    } );
                    fnCallback( aPeople );
                } );
             } ); 
        },

        getFriends: function( fnCallback ) {
            return principal.getIdentify()
            .then( function( identity ) {
                return firebase.database().ref( 'peoples/' + identity.id + '/friends').on( 
                'value',
                function ( pendingSnapshots ) {
                    var pendingPromises = [];
                    pendingSnapshots.forEach( function( pendingSnapshots ) {
                        var path = 'peoples/' + pendingSnapshots.key;
                        var oPromise = firebase.database().ref( path ).once( 'value' );
                        pendingPromises.push( oPromise );
                    } );

                    $q.all( pendingPromises )
                    .then( function( result ) {
                        var aPeople = [];
                        result.forEach( function( peopleSnapshot ) {
                            var personModel = {
                                name: peopleSnapshot.child( 'name' ).val(),
                                avatar: peopleSnapshot.child( 'avatar' ).val(),
                                id: peopleSnapshot.key
                            };
                            aPeople.push( personModel );
                        } );
                        fnCallback( aPeople );
                    } );
                } );
            } );
        },
        getPending: function( fnCallback ) {
            return principal.getIdentify()
            .then( function( identity ) {
                return firebase.database().ref( 'peoples/' + identity.id + '/pending').on( 
                'value',
                function ( pendingSnapshots ) {
                    var pendingPromises = [];
                    pendingSnapshots.forEach( function( pendingSnapshots ) {
                        var path = 'peoples/' + pendingSnapshots.key;
                        var oPromise = firebase.database().ref( path ).once( 'value' );
                        pendingPromises.push( oPromise );
                    } );

                    $q.all( pendingPromises )
                    .then( function( result ) {
                        var aPeople = [];
                        result.forEach( function( peopleSnapshot ) {
                            var personModel = {
                                name: peopleSnapshot.child( 'name' ).val(),
                                avatar: peopleSnapshot.child( 'avatar' ).val(),
                                id: peopleSnapshot.key
                            };
                            aPeople.push( personModel );
                        } );
                        fnCallback( aPeople );
                    } );
                } );
            } );
        },

        getOnce: function( friendList ) {
            return principal.getIdentify()
            .then( function( identity ) {
                return firebase.database().ref( 'peoples/' + identity.id + '/' + friendList ).once( 'value' );
            } )
            .then( function( peoplesSnapshot ) {
                var peopleList = [];
                peoplesSnapshot.forEach( function( personSnapshot ){
                    peopleList.push( personSnapshot.key );
                } );

                return peopleList;
            });
        },
        /**
        * Adds new eater to offer with given id
        * @param {offer} Offer
        */
        updateOffer: function updateOffer( offer ) {
            return $q.all();
        },
        /**
        * Get all offers
        * @returns {offers[]} All offers
        **/
        getOffers: function getOffers( fnCallback ) {
            offers = [];
            var self = this;
            var fb = firebase.database();
            principal.getIdentify()
            .then( function( identity ){
                return fb.ref( 'peoples/' + identity.id + '/friends' )
                .on( 'child_added', friendAdded ); // Listens when child is added
            } );

            return offers;
            function friendAdded( friendSnap ) {
                var ref = fb.ref( 'offers' );
                ref.orderByChild( 'creator' ).equalTo( friendSnap.key )
                .on( 'child_added', function( offerSnap ) {
                    self.buildOffer( offerSnap )
                    .then( function ( offerModel ) {
                        offers.push( offerModel );
                        $ionicScrollDelegate.resize();
                    } );
                } );
            }
        },

        buildOffer: function( offerSnap ) {
            var fb = firebase.database();
            var creatorId = offerSnap.child( 'creator' ).val();
            var offerModel = {
                id : offerSnap.key,
                numOfPersons: offerSnap.child( 'numOfPersons' ).val(),
                location: offerSnap.child( 'location' ).val(),
                time: offerSnap.child( 'time' ).val(),
                owner: {},
                eaters: [],
                canEdit: true
            };
            var ownerPromise = fb.ref( 'peoples/' + creatorId ).once( 'value' )
            .then( function ( ownerSnap ) {
                var ownerModel = {
                    name : ownerSnap.child( 'name' ).val(),
                    avatar: ownerSnap.child( 'avatar' ).val()
                };

                offerModel.owner = ownerModel;
            } )

            var eatersPromise = fb.ref( 'offers/' + offerModel.id + '/eaters' ).once( 'value' )
            .then( function ( eaters ) {
                var promises = [];
                eaters.forEach( function ( eater ) {
                    promises.push( fb.ref( 'peoples/' + eater.key ).once( 'value' )
                    .then( function ( personSnap ) {
                        var personModel = {
                            id: personSnap.key,
                            avatar: personSnap.child('avatar').val(),
                            name: personSnap.child('name').val()
                        };

                        offerModel.eaters.push( personModel );
                        return true;
                    } ) );
                } );

                return $q.all( promises );
            } )

            var editPromise = principal.getIdentify()
            .then( function( identity ){
                return fb.ref( 'waitingList/' + offerModel.id + '/' + identity.id )
                .once( 'value' )
                .then( function ( waitSnap ) {
                    console.log( 'waitSnap', waitSnap.key, waitSnap.val() );
                    if( waitSnap.exists() ) {
                        console.log( 'cant edit' );
                        offerModel.canEdit = false;
                    }
                    return $q.when();
                } );
            } )
            .then( function (  ) {
                
            } )
            return $q.when( eatersPromise, ownerPromise, editPromise )
            .then( function(){
                return offerModel;
            } );
        },

        getMyOffer: function () {
            var self = this;
            var fb = firebase.database();
            return principal.getIdentify()
            .then( function ( identity ) {
                var ref = fb.ref( 'offers/' )
                return ref.orderByChild( 'creator' )
                .equalTo( identity.id )
                .limitToLast( 1 )
                .once( 'value' );
            } )
            .then( function ( offersSnaps ) {
                var timestamp;
                var lastOffer;
                offersSnaps.forEach( function ( offerSnap ) {
                    console.log( offerSnap.child( 'location' ).val() )
                    if( !timestamp || timestamp > offerSnap.child( 'timestamp' ).val() ) {
                        timestamp = offerSnap.child( 'timestamp' ).val();
                        lastOffer = offerSnap;
                    }
                } );

                return lastOffer;
            } )
            .then( function ( snapshot ) {
                    return self.buildOffer( snapshot );
                } )
            .then( function ( offerModel ) {
                return self.buildEatersWaitList( offerModel.id )
                .then( function ( aEatersWaitList ) {
                    offerModel.eatersWaitList = aEatersWaitList;
                    return offerModel;
                } );
            } );
        },

        buildEatersWaitList: function( offerId ) {
            var fb = firebase.database();
            var self = this;
            return fb.ref( 'waitingList/' + offerId ).once( 'value' )
            .then( function ( potentialEaters ) {
                var potentialEatersPromises = [];
                potentialEaters.forEach( function ( eaterSnapshot ) {
                    potentialEatersPromises.push( self.buildPerson( eaterSnapshot.key ) );
                } );

                return $q.all( potentialEatersPromises );
            });
        },

        buildPerson: function( personId ) {
            var fb = firebase.database();
            return fb.ref( 'peoples/' + personId ).once( 'value' )
            .then( function ( personSnap ) {
                var personModel = {
                    id: personSnap.key,
                    name: personSnap.child( 'name' ).val(),
                    avatar: personSnap.child( 'avatar' ).val(),
                    email: personSnap.child( 'email' ).val()
                }

                return personModel;
            } )
        }
    }
}]);
angular.module('sentdevs.services.offersService', [])
    //Sockets needed?
.factory('offersService', ['dataService', 'principal', '$q', function (dataService, principal, $q) {

    //Map of offers id with it's callbacks
    var subsribers = {};
    
    function checkIfUserCanCreateOffer( id ) {
        return id;
    }
    function createOffer( offer ) {
        return principal.getIdentify()
        .then( function( identity ){
            return checkIfUserCanCreateOffer( identity.id );
        } )
        .then( function( creatorId ) {
            offer.creator = creatorId;
            offer.timestamp = Date.now();
            var key = firebase.database().ref().child( 'offers' ).push().key;
            return firebase.database().ref( 'offers/' + key ).set( offer );
        } );
    }

    function requestMeal( userId, offerId ) {
        return firebase.database().ref( 'waitingList/' + offerId + '/' + userId )
        .set( true );
    }
    /**
    * Retrive user and add it to offer eaters. Update offer
    * @returns {promise} 
    **/
    function signForOffer( offer ) {
        if (offer.eaters.length < offer.numOfPersons) {
            return principal.getIdentify()
            .then( function( identity ) {
                var bShouldPush = true;
                angular.forEach( offer.eaters, function( oEater ) {
                    if( angular.equals( identity.id, oEater.id ) ) {
                        bShouldPush = false;
                    }
                } );
                if( bShouldPush ) {
                    requestMeal( identity.id, offer.id );
                } else {
                    return $q.when();
                }
            });            
        }
        return $q.all();
    }
    function notifyView( offer ) {
        subsribers[offer.id].callback( offer );
    }
    function subscribe(offer, fnCallback) {
        firebase.database().ref( 'offers/' + offer.id + '/eaters' )
        .on( 'child_added', function( offerSnap ) { //Listen on eater added
            firebase.database().ref( 'offers/' + offer.id )
            .once( 'value' ).then( function( offerSnap ){
                return dataService.buildOffer( offerSnap );            
            })
            .then( function ( offerModel ) {
                fnCallback( offerModel );
            } );
        } );
    }
    function getOffers() {
        return dataService.getOffers();
    }
    
    function getUnresolvedOffersCount() {
        return $q.when(11);
   
    }
    
    function getMyOffers() {
        return dataService.getMyOffer();
    }
    function createChat( offerId, id ) {
        var fb = firebase.database();
        return fb.ref( 'offers/' + offerId ).once( 'value' )
        .then( function ( offerSnap ) {
            var chatHeader = offerSnap.child( 'location' ).val();
            var chat = {
                timestamp: Date.now(),
                lastMessage: '',
                title: chatHeader,
                sender: id
            };

            return chat;
        } )
        .then( function( chat ){
            return fb.ref( 'chats/' + offerId ).set( chat );
        } );
    }
    function createMembers( offerId, id ) {
        var fb = firebase.database();
        return principal.getIdentify()
        .then( function (identity) {
            return $q.when( 
                fb.ref( 'members/' + offerId + '/' + id ).set(true),
                fb.ref( 'members/' +offerId + '/' + identity.id ).set(true)
            );
        } );
    }
    function acceptOffer( offerId, id ) {
        var self = this;
        var fb = firebase.database();
        return fb.ref( 'offers/' + offerId + '/eaters/' + id ).set( true )
        .then( function () {
            return self.declineOffer( offerId, id );
        } )
        .then( function () {
            return fb.ref( 'chats/' + offerId ).once( 'value' );
         })
        .then( function( chatSnap ) {
            if( chatSnap.exists() ) {
                return fb.ref( 'members/' + offerId + '/' + id ).set( true );
            } else {
                return $q.when( createChat( offerId, id ) , createMembers( offerId, id ) );
            }
        } );
    }

    function declineOffer( offerId, id ) {
        var fb = firebase.database();
        return fb.ref( 'waitingList/' + offerId + '/' + id ).remove();
    }
    return {
        signForOffer: signForOffer,
        getAll: getOffers,
        getUnresolvedOffersCount : getUnresolvedOffersCount,
        createOffer: createOffer,
        getmyOffers: getMyOffers,
        subscribe: subscribe,
        acceptOffer: acceptOffer,
        declineOffer: declineOffer
    };
}]);
angular.module('sentdevs.services.peopleService', [])
.factory('peopleService', ['dataService', '$q', 'principal', function ( dataService, $q, principal ) {
    return {
        getFriends: function ( fnCallback ) {
            return dataService.getFriends( fnCallback );
        },
        getPending: function( fnCallback ) {
            return dataService.getPending( fnCallback );
        },
        getPeople: function( fnCallback ) {
            var peopleFilter = function( peoples ) {
                var lists = [ 'pending', 'waiting', 'friends' ];
                var promises = [];
                var filter = function( people ) {
                    peoples = peoples.filter( function ( item ) {
                        return people.indexOf( item.id ) === -1;
                    } );
                    return true;
                };
                dataService.getOnce( 'pending' )
                .then( filter )
                .then( function() {
                    return dataService.getOnce( 'waiting' )
                    .then( filter );
                })
                .then (function () {
                    return dataService.getOnce( 'friends' ).then( filter );
                } )
                .then( function () {
                    fnCallback( peoples );
                } );
            }
            return dataService.getPeople( peopleFilter );
        },

        addFriend: function( friendId ) {
            var userId;
            return principal.getIdentify()
            .then( function ( identity ) {
                userId = identity.id;
                return firebase.database().ref( 'peoples/' + friendId + '/pending/' + identity.id ).set( true );
            } )
            .then( function () {
                return firebase.database().ref( 'peoples/' + userId + '/waiting/' + friendId ).set( true );
            } )
        },

        acceptFriendRequest: function( id ) {
            var userId;
            return principal.getIdentify()
            .then( function( identity ) {
                userId = identity.id;
                return firebase.database().ref( 'peoples/' + identity.id + '/friends/' + id ).set( true );
            } )
            .then( function () {
                return firebase.database().ref( 'peoples/' + id + '/friends/' + userId ).set( true );
            } )
            .then( function () {
                return this.declineFriendRequest( id );
            }.bind( this ) )
        },

        declineFriendRequest: function( id ) {
            var userId; 
            return principal.getIdentify()
            .then( function( identity ) {
                userId = identity.id;
                return firebase.database().ref( 'peoples/' + identity.id + '/pending/' + id ).remove();
            } )
            .then( function () {
                var path = 'peoples/' + id + '/waiting/' + userId;
                return firebase.database().ref( 'peoples/' + id + '/waiting/' + userId ).remove();
            } )
        }
    };
}]);
angular.module('sentdevs.services.principalService', [])
.factory('principal', ['$q', '$openFB', '$state', '$log', function ($q, $openFB, $state, $log) {
    var _identity = undefined;

     function registerUser( oUser ) {
        var query = firebase.database().ref('peoples').orderByKey();
        return query.once( 'value' )
        .then( function( personsSnapshot ) {
            var bMatch = false;
            var key;
            personsSnapshot.forEach( function( personSnapshot ) {
                key = personSnapshot.key;
                var email = personSnapshot.child( 'email' ).val();
                if( email &&
                    email === oUser.email ) {
                        // We have a match
                        bMatch = true;
                        return bMatch;
                    }
            } );

            if( !bMatch ) {
                key = firebase.database().ref().child( 'peoples' ).push().key;
                return firebase.database().ref( 'peoples/' + key ).set( oUser )
                .then( function () {
                    return key;
                } );
            } else {
                return $q.when( key );
            }
        } );
    }
    function toDataUrl(url){
        var deferred = $q.defer();
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function() {
        var reader  = new FileReader();
        reader.onloadend = function () {
            deferred.resolve(reader.result);
        }
        reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.send();

        return deferred.promise;
    }
    function setIdentity() {
        //TODO: store user identity in localstorage and perform checking before retriving from api
        return $q.all(
            [$openFB.api({path: '/me'}),
            $openFB.api({path: '/me/picture', params: {redirect: false}})])
            .then(function(aResolved) {
            //aResolved[0] == information
            //aResolved[1] == picture path
            

            var identity = {};
            angular.extend(identity, aResolved[0]);
            angular.extend(identity, {avatar: aResolved[1].data.url});
            identity.id = localStorage.getItem( 'id' );
            return identity;
        });
    }
    return {
        isUserLoged: function() {
            return $openFB.isLoggedIn().then(function(res){
                //user is loged in
                return true;   
            }, function(error) {
                //user is not loged in
                $state.go('signin');
            });
        },
        
        getIdentify: function() {
            if( angular.isDefined( _identity ) ) {
                return $q.when(_identity);
            }
            return setIdentity().then(function(identity) {
                _identity = identity;
                return _identity;
            });            
        },
        
        logIn: function() {
            var provider = new firebase.auth.FacebookAuthProvider();
            provider.addScope( 'public_profile' );
            provider.addScope( 'user_friends' );
            return firebase.auth().signInWithPopup( provider )
            .then( function( result ) { 
                var token = result.credential.accessToken;
                var user = result.user;
                var canvas = document.createElement( 'canvas' );
                window.sessionStorage.setItem( 'fbtoken', token );
                return $q.all( [toDataUrl( user.photoURL ), $q.when( user )] );
            } )
            .then( function ( result ) {
                var userAvatar = result[0];
                var user = result[1];
                var userModel = {
                    name: user.displayName,
                    avatar: userAvatar,
                    email: user.email,
                    friends: {},
                    offers: {},
                    chats: {},
                };

                return registerUser( userModel );
            } )
            .then( function ( key ) {
                localStorage.setItem( 'id', key );
            } )
        }
    };
}]);
angular.module('sentdevs.services.userService', [])
.factory('userService', ['$q', '$log', 'principal', function ($q, $log, principal) {
    var user = {
        name: 'Žiga',
        surname: 'Ajdnik',
        avatar: 'https://scontent-vie1-1.xx.fbcdn.net/hprofile-xta1/v/t1.0-1/p160x160/10616063_10201741780905426_7128050048956798732_n.jpg?oh=40aba6b595e3d47632346961fa6166ac&oe=56FCDE24'
    };
    return {
        getUser: function getUser() {
            return principal.getIdentify();
        }
    };
}]);
angular.module('sentdevs.services', ['sentdevs.services.dataService',
    'sentdevs.services.offersService',
    'sentdevs.services.peopleService',
    'sentdevs.services.userService',
    'sentdevs.services.principalService',
    'sentdevs.services.chatService'
]);