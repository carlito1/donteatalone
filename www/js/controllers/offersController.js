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
        var getAllOffers = function () {
            return offersService.getmypastoffers()
            .then(function (pastoffer) {
                $scope.mypastoffers = pastoffer;
                return true;
            });
        };

        getAllOffers()
        .then( function() {
            return getMyOffers();
        } );

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