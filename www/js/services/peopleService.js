angular.module('sentdevs.services.peopleService', [])
.factory('peopleService', ['dataService', function (dataService) {
    var people = dataService.getPeople();
    return {
        getAll: function () {
            return people;
        },
        findPerson: function () {
            var result = [];
            result.push(people[0]);
            return result;
        }
    };
    
    function cencelFriendRequest(eStatus) {
            people.getAll().then(function(people){
               
            });
        
    }
    
     function FreindRequest(eStatus) {
           
        
    }
    
    
}]);