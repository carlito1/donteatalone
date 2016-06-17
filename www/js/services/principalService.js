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