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