angular.module('sentdevs.services.offersService', [])
    //Sockets needed?
.factory('offersService', ['dataService', 'userService', function (dataService, userService) {
    //Map of offers id with it's callbacks
    var subsribers = {};
    /**
    * Retrive user and add it to offer eaters. Update offer
    * @returns {promise} 
    **/
    function signForOffer(offer) {
        if (offer.eaters.length < offer.numOfPersons) {
            userService.getUser().then(function(user){
                console.log(user, offer);
                offer.eaters.push(user);
                notifyView(offer.id);
            });
            
        }
        return dataService.updateOffer(offer);
    }
    /**
    * Listens for offers changed. If offer changed assign new eater to view.
    **/
    function offersChangeListener(offerId, eater) {
        if (subsribers.hasOwnProperty(offerId) && subsribers[offerId]) {
            var originalOffer = subsribers[offerId];
            if(originalOffer.offer.eaters.length === 0) {
                originalOffer.offer.eaters.push(eater);
            } else {
                angular.forEach(originalOffer.offer.eaters, function (orgEater) {
                    if (!angular.equals(eater, orgEater)) {
                        originalOffer.offer.eaters.push(eater);
                        notifyView(offerId);
                    }
                });
            }
        }
    }
    function notifyView(id) {
        subsribers[id].callback();
    }
    function subscribe(offer, fnCallback) {
        dataService.subscribeToOffersChanges(offer.id, offersChangeListener);
        subsribers[offer.id] = { 
            callback: fnCallback,
            offer: offer
        };
       
    }
    function getOffers() {
        return dataService.getOffers();
    }
    return {
        signForOffer: signForOffer,
        subscribe: subscribe,
        getAll: getOffers
    };
}]);