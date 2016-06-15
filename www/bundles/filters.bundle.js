angular.module('sentdevs.filters', ['sentdevs.filters.peopleFilter']);
angular.module('sentdevs.filters.peopleFilter', [])
.filter('people', function () {
    return function (originalArray, query) {
        originalArray = originalArray || [];
        query = query || '';
        query = query.toLowerCase();

        var filtered = [];
        angular.forEach(originalArray, function (item) {
            if ((item.hasOwnProperty("name") && typeof item.name === "string" && item.name.toLowerCase().indexOf(query) !== -1) ||
                (item.hasOwnProperty("surname") && typeof item.surname === "string" && item.surname.toLowerCase().indexOf(query) !== -1)) {
                filtered.push(item);
            } 
        });

        return filtered;
    };
});
