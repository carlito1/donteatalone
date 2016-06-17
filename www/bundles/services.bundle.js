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
                console.log( 'Edit', 'waitingList/' + offerModel.id + '/' + identity.id );
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