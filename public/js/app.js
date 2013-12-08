var app = angular.module('app', [
    'ngRoute',
    'route-segment',
    'view-segment',
]);

function NavCtrl($scope, $routeSegment) {
    $scope.$routeSegment = $routeSegment;
}

app.config(function ($routeSegmentProvider, $routeProvider) {
    $routeSegmentProvider.options.autoLoadTemplates = true;

    $routeSegmentProvider
        .when('/', 'first')
        .when('/second', 'second')

        .segment('first', {
            templateUrl: 'partials/first.html'
        })
        .segment('second', {
            templateUrl: 'partials/second.html'
        })

    ;


    $routeProvider.otherwise({redirectTo: '/'});

});
