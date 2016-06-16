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