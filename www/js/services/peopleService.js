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