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
angular.module('sentdevs.controllers.offersController', [])
.controller('OffersController', ['$scope', 'offersService', function ($scope, offersService) {

       $scope.myoffer = {};
       offersService.getmyOffers()
       .then(function (offer) {
            $scope.myoffer = offer;
       });
       
       $scope.mypastoffers = [];
       offersService.getmypastoffers()
       .then(function (pastoffer) {
            console.log("test",pastoffer);
            $scope.mypastoffers = pastoffer;
       });
     
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
          '$ionicLoading',
          function ($scope, offersService, $ionicLoading) {
    $scope.offers = [];
    getOffers();
    
    function getOffers() {
        $scope.offers = offersService.getAll();
    }
    $scope.placeOffer = function( offer ) {
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
        controller: ['$scope', 'offersService', function ($scope, offersService) {
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
.factory('chatService', ['$q', '$log', function ($q, $log) {
    var chats = [{
        id: 0,
        header: 'Samo bedaki in konji',
        messages: [
            {
                id: 1,
                sender: {
                    avatar: 'http://media.comicbook.com/wp-content/uploads/2013/08/rambo-tv-series.jpg',
                    name: 'John',
                    surname: 'Rambo'
                },
                message: 'Kva je?!',
                timestamp: '1465997742'
            },
            {
                id: 2,
                sender: {
                    avatar: 'http://media.comicbook.com/wp-content/uploads/2013/08/rambo-tv-series.jpg',
                    name: 'John',
                    surname: 'Rambo'
                },
                message: 'Picke?!',
                timestamp: '1465997743'
            }
        ]
    }];
    return {
        getChats: function getChats() {
            var deferred = $q.defer();
            setTimeout( function () {
                deferred.resolve( chats );
            }, 500 )
            return deferred.promise;
        },

        getMessages: function( id ) {
            return $q.all( chats[id].messages );
        },

        sendMessage: function( id, message ) {
            chats[id].messages.push( message );
            return $q.all( message );
        }
    };
}]);
angular.module('sentdevs.services.dataService', [])
.factory('dataService', ['$http', '$q', 'principal', function ($http, $q, principal) {
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

            var eatersPromise = fb.ref( 'eaters/' + offerModel.id ).once( 'value' )
            .then( function ( eaters ) {
                var promises = [];
                eaters.forEach( function ( eater ) {
                    promises.push( fb.ref( 'peoples/' + eater.key ).once( 'value' )
                    .then( function ( personSnap ) {
                        var personModel = {
                            id: personSnap.key,
                            avatar: personSnap.avatar.val(),
                            name: personSnap.name.val()
                        };

                        offerModel.eaters.push( personModel );
                        return true;
                    } ) );
                } );

                return $q.all( promises );
            } )

            var editPromise = principal.getIdentify()
            .then( function( identity ){
                return fb.ref( 'waitingList/' + offerModel.id + '/' + identity.id  )
                .once( 'value' )
                .then( function ( waitSnap ) {
                    if( waitSnap.exists() ) {
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
        /**
        * Add new offer
        * @param {offer} Offer
        **/
        addOffer: function(offer) {
            var deferred = $q.defer();
            offers.push(offer);
            deferred.resolve();
            return deferred.promise;
        },
        /**
         * subscribe to new offers notification 
         * @param {function} callback function 
         */
        subscribeToOfferAdded: function(fnCallback) {
            offerAddedSubscribers.push(fnCallback);
        },
        /**
        * Subscribe to offers changes
        **/
        subscribeToOffersChanges: function subscribeToOffersChanges(id, fnCallback){
            offersChangesSubscribers[id] = fnCallback;
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
        firebase.database().ref( 'waitingList/' + offerId + '/' + userId )
        .set( true )
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
        firebase.database().ref( 'offersEaters/' + offer.id )
        .on( 'value', function( offerSnap ) { //Listen on eater added
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
        return $q.when(12);
   
    }
    
    function getMyOffers(user)
    {
        var myoffers = 
                {
                id: 1,
                name: 'Marko',
                surname: 'Deželak',
                avatar: 'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-1/c46.47.579.579/s160x160/47055_131205306931574_6086166_n.jpg?oh=23e003be242df1f3dac840c146f578e9&oe=57D2451D' ,
                location: 'Lasko',
                time: '5:10',
                numberofeaters: 4,
                eaters: [{
                    id: 1,
                    name: 'Angelina',
                    surname: 'Jolie',
                    avatar: 'https://external-vie1-1.xx.fbcdn.net/safe_image.php?d=AQB0kZh_Sj1LFFHN&w=264&h=264&url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F2%2F20%2FAngelina_Jolie_Cannes_2011.jpg&colorbox&f'
                },
                {
                    id: 2,
                    name: 'Žiga',
                    surname: 'Ajdnik',
                    avatar: 'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-1/p160x160/10440220_10204364463110842_6072023070178427452_n.jpg?oh=51971df9d7d66b8e9ef4efc1b9f026c1&oe=57CEB599'
                }],
                   eatersWaitList: [{
                    id: 3,
                    name: 'James',
                    surname: 'Bond',
                    avatar: 'data:image/jpeg;base64,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'
                },
                {
                    id: 4,
                    name: 'Taylor',
                    surname: 'Swift',avatar:'http://static1.businessinsider.com/image/52790bfd69beddf46041ccc2/taylor-swift-wrote-an-op-ed-in-the-wall-street-journal-and-its-filled-with-fascinating-insights.jpg'
                }]
        }    
        var deferred = $q.defer();
        deferred.resolve(myoffers);
        return deferred.promise;
    }
     function getMyPastOffers(user)
    {
        var mypastoffers = [
                {
                id: 5,
                name: 'Marko',
                surname: 'Deželak',
                avatar: 'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-1/c46.47.579.579/s160x160/47055_131205306931574_6086166_n.jpg?oh=23e003be242df1f3dac840c146f578e9&oe=57D2451D' ,
                location: 'AlCapone',
                time: '12:10',
                numberofeaters: 2
                },
                {
                id: 6,
                name: 'Marko',
                surname: 'Deželak',
                avatar: 'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-1/c46.47.579.579/s160x160/47055_131205306931574_6086166_n.jpg?oh=23e003be242df1f3dac840c146f578e9&oe=57D2451D' ,
                location: 'Pri Štajercu',
                time: '14:30',
                numberofeaters: 2
                }];
                
                  
            
        var deferred = $q.defer();
        deferred.resolve(mypastoffers);
        return deferred.promise;
    }
    
    
   /* function acceptOffer(id)
    {  
        var x = 0;
        if (getMyOffers.myoffers.eaters.length < getMyOffers.myoffers.numberofeaters) 
        { while (getMyOffers.myoffers.waitlist[x].id != getMyOffers.myoffers.waitlist[id].id)
            {
                x++;
            }
            var result = [];
            result = getMyOffers.myoffers.waitlist[x]; 
         }
    }  */

    return {
        signForOffer: signForOffer,
        getAll: getOffers,
        getUnresolvedOffersCount : getUnresolvedOffersCount,
        createOffer: createOffer,
        getmyOffers: getMyOffers,
        //acceptOffer: acceptOffer,
        getmypastoffers: getMyPastOffers,
        subscribe: subscribe
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