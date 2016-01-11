angular.module('sentdevs.services.principalService', [])
.factory('principal', ['$q', '$openFB', '$state', '$log', function ($q, $openFB, $state, $log) {
    var _identity = undefined;
    function setIdentity() {
        //TODO: store user identity in localstorage and perform checking before retriving from api
        return $q.all([$openFB.api({path: '/me'}), $openFB.api({path: '/me/picture', params: {redirect: false}})]).then(function(aResolved) {
            //aResolved[0] == information
            //aResolved[1] == picture path
            

            var identity = {};
            angular.extend(identity, aResolved[0]);
            angular.extend(identity, {avatar: aResolved[1].data.url});
            
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
            var deferred = $q.defer();
            if(angular.isDefined(_identity)) {
                deferred.resolve(_identity);
            }
            setIdentity().then(function(identity) {
                _identity = identity;
                deferred.resolve(_identity);
            });
            
            return deferred.promise;
        },
        
        logIn: function() {
            return $openFB.login({scope: 'public_profile, user_friends'}).then(function(token) {
                // Add token to server
                return true;
            }, function(error) {
                // Error loging in
                return error;
            });
        }
    };
}]);