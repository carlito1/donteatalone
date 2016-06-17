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