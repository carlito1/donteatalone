﻿angular.module('sentdevs.services.offersService', [])
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
        return $q.when(11);
   
    }
    
    function getMyOffers() {
        return dataService.getMyOffer();
    }
    function getMyPastOffers(user) {
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
    function createChat( offerId ) {
        var fb = firebase.database();
        return fb.ref( 'offer/' + offerId ).once( 'value' )
        .then( function ( offerSnap ) {
            var chatHeader = offerSnap.child( 'location' ).val();
            var chat = {
                timestamp: Date.now(),
                lastMessage: '',
                title: chatHeader
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
                return $q.when( createChat( offerId ) , createMembers( offerId, id ) );
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
        getmypastoffers: getMyPastOffers,
        subscribe: subscribe,
        acceptOffer: acceptOffer,
        declineOffer: declineOffer
    };
}]);