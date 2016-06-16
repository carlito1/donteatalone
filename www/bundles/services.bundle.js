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
<<<<<<< HEAD
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
=======
        getPeople: function () {
            return [
                {
                    name: 'Žiga',
                    surname: 'Ajdnik',
                    status: eStatus.FRIEND,
                    picture: 'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-1/p160x160/10440220_10204364463110842_6072023070178427452_n.jpg?oh=51971df9d7d66b8e9ef4efc1b9f026c1&oe=57CEB599'
                },
                {
                    name: 'Marko',
                    surname: 'Deželak',
                    status: eStatus.FRIEND,
                    picture: 'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-1/c46.47.579.579/s160x160/47055_131205306931574_6086166_n.jpg?oh=23e003be242df1f3dac840c146f578e9&oe=57D2451D'
                },
                {
                    name: 'Carmen',
                    surname: 'Electra',
                    status: eStatus.FRIEND,
                    picture: 'data:image/jpeg;base64,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'
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
                    picture:'data:image/jpeg;base64,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'
                },
                {
                    name: 'Emma',
                    surname: 'Stone',
                    status: eStatus.NOT_FRIEND,
                    picture:'http://img0.ndsstatic.com/wallpapers/f96e18dac38b66ad181d5bbbb8714c51_large.jpeg'
                }
>>>>>>> development
                
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
                eaters: []
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
            return $q.when( eatersPromise, ownerPromise )
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
<<<<<<< HEAD
.factory('offersService', ['dataService', 'principal', '$q', function (dataService, principal, $q) {
=======
.factory('offersService', ['dataService', 'userService','$q', function (dataService, userService, $q) {
>>>>>>> development
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
        firebase.database().ref( 'offersEaters/' + offer.id )
        .on( 'value', function( offerSnap ){
            dataService.buildOffer( offerSnap )
            .then( function ( offerModel ) {
                fnCallback( offerModel );
            } );
        } );
    }
    function getOffers() {
        return dataService.getOffers();
    }
    
    function getUnresolvedOffersCount() {
        return $q.all(12);
   
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
        getmypastoffers: getMyPastOffers
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
                lists.forEach( function ( list ) {
                    promises.push( dataService.getOnce( list )
                    .then( function( people ) {
                        peoples = peoples.filter( function ( item ) {
                            return people.indexOf( item.id ) === -1;
                        } );
                    } ) );
                } );

                $q.all( promises )
                .then( function() {
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
<<<<<<< HEAD
=======
    
    function cancelFriendRequest(person) {
            person.status = person.status.eStatus[3];
    };
        
    
    
   
    
    
>>>>>>> development
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