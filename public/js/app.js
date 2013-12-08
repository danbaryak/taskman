var app = angular.module('app', [
    'ngRoute',
    'route-segment',
    'view-segment',
    'ngAnimate'
]);

function NavCtrl($scope, $routeSegment) {
    $scope.$routeSegment = $routeSegment;
}

app.config(function ($routeSegmentProvider, $routeProvider) {
    $routeSegmentProvider.options.autoLoadTemplates = true;

    $routeSegmentProvider
        .when('/', 'first')
        .when('/second', 'second')
        .when('/second/overview', 'second.overview')
        .when('/second/info', 'second.info')

        .segment('first', {
            templateUrl: 'partials/first.html'
        })
        .segment('second', {
            templateUrl: 'partials/second.html',
            controller: NavCtrl
        }).
        within().

        segment('overview', {
            templateUrl: 'partials/overview.html'}).

        segment('info', {
            templateUrl: 'partials/info.html'})


    ;

    socket.on('hello', function (data) {
        bootbox.alert(data.message);
    })

    $routeProvider.otherwise({redirectTo: '/'});

});

