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
}]);