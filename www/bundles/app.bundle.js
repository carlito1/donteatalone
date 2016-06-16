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
            console.log('Totrata', bStatus);
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
    $scope.people = [];
    $scope.people = peopleService.getAll();

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
angular.module('sentdevs.directives', ['sentdevs.directives.offerDirective']);
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
angular.module('sentdevs.filters', ['sentdevs.filters.peopleFilter']);
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

angular.module('sentdevs.services', ['sentdevs.services.dataService',
    'sentdevs.services.offersService',
    'sentdevs.services.peopleService',
    'sentdevs.services.userService',
    'sentdevs.services.principalService',
    'sentdevs.services.chatService'
]);
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
.factory('dataService', ['$http', '$q', function ($http, $q) {
    var eStatus = {
        FRIEND : 0,
        WAITING : 1,
        NOT_FRIEND: 2
    };
    var offerAddedSubscribers = [];
    var offersChangesSubscribers = {};
    var chatSubscribers = {};
    var offers = [{
        id: 1,
        owner: {
            name: 'James',
            surname: 'Bond',
            avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxQSEBMSEBQVFBQVFxAVEBQUEBQYFRYWFRUYFhcXFRYYHyggGBolHRUVIjIhJikrLi4uGB8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAK8BIAMBIgACEQEDEQH/xAAcAAEAAgIDAQAAAAAAAAAAAAAABgcEBQECAwj/xAA9EAACAQIDBAkACAUDBQAAAAAAAQIDEQQSIQUGMUEHEyJRYXGBkaEUMkJSYnKxwSOSotHwssLhM2OCg/H/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AnIAAAAAAAAAAAAAAAAAAAAAAAAAAAAARVb7U5YinRp05OMqyoTnKSjZyTyShFXzRbT42JUV1vxsnqMTDGRfZnXwU5q/CdJzUn5NSg/RgWKeeIrxpxc5yUYrVtvQ9GVvvhtKeLq9RRdoQk4t8rrRy8X3eHmBlbZ6RlGTjhqee3Ccr2v8AlX9yJbS33xclpWlGV/sdlW7rWNu91oRp5byzc3e+pHsVuw07Kpfzj/yBut2+kmtCShi2qsOc8qU146aP2LWwuIjUhGcGpRkk4tc0z5/exJp8UWB0f7W+jKOGrO8Kk7UZ8ozf2H3KVtH3+YFigAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABE+lGjm2bVtxi6b/qVyWGj33pZtn4ld1OcvZXAz8VjcuGlW7qTqf0ZkV9sKN1d6vNfR30XiSOnWlU2dgY37NaOHp13b7LpWkvC7RqN2KEabrU1JTSimpLmr6fo/YDe42CsnHyZGdprK02ra2G8W0nkWWVS8YynNQStGMeMpOzI9g8TXrTjBSm3KzUZxVpReqalb9QMqur6/sebqZYtrjDLOPnCSkv0PDa2OlT7KVmr5m1ex22BnqVoKTzKUqUXFwtdTnFceXEC6wGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGDtylnw1aP3oTXurGcYe1sRkozk1fsy/R6vwAiG4W24VsJTwkuzVgpdVm4VFCTknHxVtV4e0i2fgIU1ZRV0nDNZZsq1Sk+fF/JVWza1TC4mg6UHVlTqzjGH2p9Z2WlbvV7d1y1cPtW81CrRqYepO7gqvVtTcYq6jOnKSzJK9nZ2TdtGBFMVJKdSmud00jM3a2VThNzbbqcO1Ll3K/pqa/bkMk5V+bk4peS4/53GNs3GStOUakoydnJxUHpG7UbSTVtQMLeTBL6RUXi/nkzbbh4dSxKctXGDav+Gyj7XNJiMbOrJzmrZrePDTjZd3yTHcHDrNUqfhgk/wAzbf8ApQEyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADXbwVoxoNTdlOVOmr985qNvk2JB+kXeOFOh1dCrB1lOEpRSzuKh2k1ZOKkpqGj5XAjGysM6m0aCi7NVYTv4U49Y/fK16m229UlVxlHM9VWiopXu1GMpyt3dlMwt0nNY/D9akpq8ZpcL9VJfOhM62yox6ytb+Jd5L8E3pw8mBH95IdbTyp2blmV1bjxIjXw8oPKo6Lvctfkm7wqcOtk81Tik/qx8bc2azEYWN1mtJvhdaRfP8z18gNBhaEpvKovNJpRSctXy0uWzu9sz6PQjB6yetR+NkrLyt+pCtgVaWFrfSK7UaLfVUZyT+vKLbffZZJK/j5lhYTFQqwU6U41IPhKElKL9UB7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHSvVUIym+EVKT8krv9APPGYuFKDnVkoRXNv4Xe/BEN2r0hxi2sPTzfiqaL0itflEW25tKeIk51JN8bRvpHXhFcuRHqqyu/FfIG42xvXia91Oo1F/Yh2Y+TS4+tyO1We09VdamI5gTZ4zqsXTrvgnQqP8uWOb4zFkY+V1p3aFCxxclpdtWs4t3Vu7wLY6P9p/SMGlN3lSXVz1u7RXZb8XG3rcD3xVG0Gu5w+bf3NNtKVpxS79SQYtpqSXPL8cf0I9iHeTfO+nmwIBt6pPrWpSk4pzVNNvKlGcl2FwSXDQx9n7Sq0J56NSdOWmsZNX/MuEl4O6N/0i4bq69GKtl6t5V3PrJZn6vX3Iq2BY+x+lOoko4qiqjXGdOWST84NNN+TRLtk794KvZdZ1Unbs1lk9M2sX7lEpnbMB9Mp31XDkclFbm7zVsNiKMVOTouUY1Kbk3DLKVm4xekWr3uu4vUAAAAAAAAAAAAAAAAAAAAAAAAAAABgbev8ARa9tX1VX/SzPDV9AKOq63sYFU2e0cPknKD4xbi/NOzsautJ+fwwMKcnF3Xqu86YiPNcHwPSs0eVN3Tj3ar9wPG5ZnRPgpRoYivJPLPJCne6UsmbM13pN290VpSpuUlFcW7E/wG8FbBU4RhK8YrWnLWPkucfQCX4hOKcna7WhrdhYbrKt3wj25ed+yvf9GZOyd6MHj11dT+DWeii5JZn/ANufCXk1fwMnZ+xqlHFXU1KhKnUjNPSSnmi4trnZKSuvvPQCC9LELVsO/wAFZe00/wDcQYsHpfpWlhZd6xC9nTK9A5SDOWzgDtF8z6TwNfrKVOenbhTlpw7UU9Pc+as3E+k9m08tGlHM52hTWZpJytFatLRNgZIAAAAAAAAAAAAAAAAAAAAAAAAAAAACqt+9nqGLm+U8s1/5cf6lIitWlbgyyukrD9ilV7s0Jevaj+kitKtVPv8AYDDqwfcmYcZWkn7mfUn/AJYw+pzTUe//AOgbDZqySdSyfJJr3O+0sdn8O9HNR2WVctDV1p6gdZskmwN+8ThVlk+vp8oVJPNH8lTVryd13WIrbUVVb042fGwE76SdrxxWGwNWEZRjUeKlFStmtCUYX05PiQZLQl/SfkhiKFClFRp0qMXTS4KM29P6L353IhfRgdZMRd07a2V3bkrpXfq0vU9MPiZQd45dbfWp058O7Onb0PXE7Tq1I5Z1JOOjyq0Y3XC8YpJgY3I+kdj1s+HoztbNTpO3a0vBadpJ+6R83ctOPI+ktjzg8PRdFJU3TpOkkrJQcVlSXkBlgAAAAAAAAAAAAAAAAAAAAAAAAAAAANRvbg+twdWK4xWePnDV/F16lOzV724Ivhq+j4cyh9v03SqVaC4qpOHonx9VYDU4is5NqHBcWNn07TzJ3Ubpvk209EdatPWNNc+NuL8/BGRVkoxUY6Jf5cDzr1repg1HqdsRLU8mwO0Hr/wdTg4A3292KdWrh5Pj9Ewd/NwbfyzSSZ6Yiu5uLf2YU4LyhFR/Y8WwBwDgDvFl9dHWN63ZuHfOClSf/rk4r+lRfqUIi2ehjF3oYijfWNSFRLwqQy/rT+QLGAAAAAAAAAAAAAAAAAAAAAAAAAAAAACp+kvBqnjutXCpTU3+aF4y+I0/dlsFd9K86c6MWr9ZSllfCzhVaUufJqPyBWeF+s5vjr86fszxrVrnZTtx5r/dL+5jT4+YHFzqAwBwGzhsDtFnBxcAchAAclidDFJvE4id9I0oxa73Kd0/TI/5iuyzOhRfxMW/w4dfNT+wFqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPHF1FGDb4c/IrXeWDrUpJJZJ3hTm9E5X+y33Wv6MsrGUlOEotX04Ln4evAqveHaaxVRUbZIwvGlG1o3indR7mkloBAMTdPtK0otxmnxUk7Ne6Z5S4G72tgZyblJuU7O75yypWzPm0ufPQ0k1bR8QOpw2CedHGAp1I1lJLrFKLakuNNrT5zX80BAQSTfjdx4OsnBfwql3D8Ml9aF/leHkRywA5OpygOQAgOS3+hrA5cLWrNf8AVqKMfGNKPH+ac16Ffbr7qV8dL+EstNO06008i8I/fl4L1aL22Ps2GGoU6FL6tOKim+LfGUnbm2234sDMAOAOQAAAAAAAAAAAAAAAAAAAAAAAAAANDvVs9fQcSqMVCVnWvFJNzg1Ucr/eeS1zfI+ft494sTWq1ozr1XTz1UoKpKMMmZpJxjZPS3EDZUNpQq2jUtGpaz5Rlf7t+D8PbuOtbZkG+1G68SIp8v2RsKW0atNJRlp3S1XpfgBIaGxKXFRSfe9fa5t906caOMhZ/XzQfqrr5jEhFbeGs1ZOMfGMdfls88BtepGvSqTnJ5KlOdr/AHZKXLyAuLe7ZKxWGnS+19am+6ceD/VeTZR0k02mrNNprua0aL+2vWaSlDg7Nu19HwXFWv36lR7+7O6rE50uzWWdea0lp7ARsAXA7XMrZbj11LrEpQ6yk5xfCUc6zJ+DV0YZ2XB+TA+nqNGMIqEIqMYq0YxSUUlySWiR3PDA1s9KnP70IS/min+57gDqzsdGB//Z'
        },
        time: '1:10',
        numOfPersons: 3,
        eaters: [],
        location: 'CasinoRoyal'
    },
     {
         id: 2,
         owner: {
             name: 'Angelina',
             surname: 'Jolie',
             avatar: 'data:image/jpeg;base64,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'
         },
         time: '2:15',
         numOfPersons: 3,
         eaters: [{
             name: 'Angelina',
             surname: 'Jolie',
             avatar: 'data:image/jpeg;base64,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'
         }],
         location: 'AlPachino'
     }];
     
     function onOfferAdded() {
         offerAddedSubscribers.forEach(function(fnCallback){
             fnCallback();
         });
     }
    return {
        getPeople: function () {
            return [
                {
                    name: 'Žiga',
                    surname: 'Ajdnik',
                    status: eStatus.FRIEND,
                    picture: 'https://scontent-vie1-1.xx.fbcdn.net/hprofile-xat1/v/t1.0-1/p160x160/10616063_10201741780905426_7128050048956798732_n.jpg?oh=e8842f9b17d004c24cbc9ef006caeeae&oe=56D55124'
                },
                {
                    name: 'Marko',
                    surname: 'Deželak',
                    status: eStatus.FRIEND,
                    picture: 'https://scontent-vie1-1.xx.fbcdn.net/hprofile-frc3/v/t1.0-1/c46.47.579.579/s160x160/47055_131205306931574_6086166_n.jpg?oh=3fec7d406af034a94741970eed039832&oe=56E4F71D',
                },
                {
                    name: 'Carmen',
                    surname: 'Electra',
                    status: eStatus.FRIEND,
                    picture: 'https://scontent-vie1-1.xx.fbcdn.net/hprofile-xtp1/v/t1.0-1/c272.0.160.160/p160x160/12208819_10153596288811265_6759630954911669327_n.jpg?oh=0bdb8d9f6d57fd4b0933d3e528532192&oe=5712F2EA'
                },
                {
                    name: 'Angelina',
                    surname: 'Jolie',
                    status: eStatus.WAITING,
                    picture: 'https://external-vie1-1.xx.fbcdn.net/safe_image.php?d=AQB0kZh_Sj1LFFHN&w=264&h=264&url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F2%2F20%2FAngelina_Jolie_Cannes_2011.jpg&colorbox&f'
                },
                {
                    name: 'Taylor',
                    surname: 'Swift',
                    status: eStatus.NOT_FRIEND,picture:'http://static1.businessinsider.com/image/52790bfd69beddf46041ccc2/taylor-swift-wrote-an-op-ed-in-the-wall-street-journal-and-its-filled-with-fascinating-insights.jpg'
                },
                {
                    name: 'Micky',
                    surname: 'Mouse',
                    status: eStatus.NOT_FRIEND,
                    picture:'http://wondersofdisney.yolasite.com/resources/mickeymouse/mickey/faces/classicmickhead.gif'
                },
                {
                    name: 'Emma',
                    surname: 'Stone',
                    status: eStatus.NOT_FRIEND,
                    picture:'http://img0.ndsstatic.com/wallpapers/f96e18dac38b66ad181d5bbbb8714c51_large.jpeg'
                }
                
            ];
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
        getOffers: function getOffers() {
            var deferred = $q.defer();
            
            deferred.resolve(offers);

            return deferred.promise;
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
    };
}]);
angular.module('sentdevs.services.offersService', [])
    //Sockets needed?
.factory('offersService', ['dataService', 'userService', '$q', function (dataService, userService, $q) {
    //Map of offers id with it's callbacks
    var subsribers = {};
    
    function createOffer(offer) {
        return dataService.addOffer(offer).then(function(){
            return true;
        }, function(){
            return false;
        });
    }
    /**
    * Retrive user and add it to offer eaters. Update offer
    * @returns {promise} 
    **/
    function signForOffer( offer ) {
        if (offer.eaters.length < offer.numOfPersons) {
            return userService.getUser()
            .then(function(user) {
                var bShouldPush = true;
                angular.forEach( offer.eaters, function( oEater ) {
                    if( angular.equals( user, oEater ) ) {
                        bShouldPush = false;
                    }
                } );
                if( bShouldPush ) {
                    offer.eaters.push( user );
                    return dataService.updateOffer(offer)
                    .then( function() {
                        notifyView( offer );
                    } );
                } else {
                    return $q.all();
                }
            });            
        }
        return $q.all();
    }
    function notifyView( offer ) {
        subsribers[offer.id].callback( offer );
    }
    function subscribe(offer, fnCallback) {
        subsribers[offer.id] = { 
            callback: fnCallback,
            offer: offer
        };
       
    }
    function getOffers() {
        return dataService.getOffers();
    }
    
    function getUnresolvedOffersCount() {
        var deferred = $q.defer();
        deferred.resolve(12);
        return deferred.promise;
    }
    return {
        signForOffer: signForOffer,
        getAll: getOffers,
        getUnresolvedOffersCount : getUnresolvedOffersCount,
        createOffer: createOffer,
        subscribe: subscribe
    };
}]);
angular.module('sentdevs.services.peopleService', [])
.factory('peopleService', ['dataService', function (dataService) {
    var people = dataService.getPeople();
    return {
        getAll: function () {
            return people;
        },
        findPerson: function () {
            var result = [];
            result.push(people[0]);
            return result;
        }
    };
    
    function cencelFriendRequest(eStatus) {
            people.getAll().then(function(people){
               
            });
        
    }
    
     function FreindRequest(eStatus) {
           
        
    }
    
    
}]);
angular.module('sentdevs.services.principalService', [])
.factory('principal', ['$q', '$openFB', '$state', '$log', function ($q, $openFB, $state, $log) {
    var _identity = undefined;
    function setIdentity() {
        //TODO: store user identity in localstorage and perform checking before retriving from api
        return $q.all([$openFB.api({path: '/me'}), $openFB.api({path: '/me/picture', params: {redirect: false}})]).then(function(aResolved) {
            //aResolved[0] == information
            //aResolved[1] == picture path
            

            var identity = {};
            angular.extend(identity, aResolved[0]);
            angular.extend(identity, {avatar: aResolved[1].data.url});
            
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
            if(angular.isDefined(_identity)) {
                return $q.all(_identity);
            }
            return setIdentity().then(function(identity) {
                _identity = identity;
                return _identity;
            });            
        },
        
        logIn: function() {
            return $openFB.login({scope: 'public_profile, user_friends'}).then(function(token) {
                // Add token to server
                return true;
            }, function(error) {
                // Error loging in
                return error;
            });
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