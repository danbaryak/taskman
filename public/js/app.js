var app = angular.module('app', [
    'ngRoute',
    'route-segment',
    'view-segment',
    'ngAnimate'
]);


app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

function NavCtrl($scope, $routeSegment) {
    $scope.$routeSegment = $routeSegment;
}


app.factory('RecursionHelper', ['$compile', function($compile){
    var RecursionHelper = {
        compile: function(element){
            var contents = element.contents().remove();
            var compiledContents;
            return function(scope, element){
                if(!compiledContents){
                    compiledContents = $compile(contents);
                }
                compiledContents(scope, function(clone){
                    element.append(clone);
                });
            };
        }
    };

    return RecursionHelper;
}]);

app.directive('task', ['$timeout', 'RecursionHelper', function ($timeout, RecursionHelper) {
    return {
        restrict: 'E',
        scope: {task: '=', parent: '='},
        templateUrl: '/partials/task.html',
        replace: true,
        compile: function(element) {
            return RecursionHelper.compile(element);
        }
    };
}]);

function TasksCtrl($scope, $routeSegment) {
    $scope.$routeSegment = $routeSegment;
    $scope.tasks = [
        {
            name: 'hi',
            children: [
                { name: 'a child' },
                { name: 'another child' }
            ]
        },
        { name: 'whatever'}
    ]
    $scope.$apply();

    $scope.inc = function() {
        $scope.count = $scope.count + 1;

    }
    $scope.addTask = function () {
        $scope.tasks.push({ name: '' })
        $scope.$apply();
    }
    $scope.keyPressed = function(task) {
        console.log("key pressed");
    }
    $scope.addTaskAfter = function(task) {
        var index = $scope.tasks.indexOf(task);
        $scope.tasks.insert(index, { name: 'another one'});
    }
}

function InfoCtrl($scope, $routeSegment) {

    $scope.loadData = function () {
        var width = 960,
            height = 600;

        var color = d3.scale.category20();

        var force = d3.layout.force()
            .charge(-300)
            .linkDistance(100)
            .size([width, height]);

        var svg = d3.select("#d3_graph").append("svg")
            .attr("width", width)
            .attr("height", height);


        d3.json("js/data.json", function (error, graph) {
            force
                .nodes(graph.nodes)
                .links(graph.links)
                .start();

            var link = svg.selectAll(".link")
                .data(graph.links)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke-width", function (d) {
                    return Math.sqrt(d.value);
                });

            var node = svg.selectAll(".node")
                .data(graph.nodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", 30)
                .style("fill", function (d) {
                    return color(d.group);
                })
                .call(force.drag);

            node.append("title")
                .text(function (d) {
                    return d.name;
                });

            force.on("tick", function () {
                link.attr("x1", function (d) {
                    return d.source.x;
                })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                node.attr("cx", function (d) {
                    return d.x;
                })
                    .attr("cy", function (d) {
                        return d.y;
                    });
            });

            d3.select("#d3_graph")
                .on("mousemove.drag", self.mousemove())
                .on("touchmove.drag", self.mousemove())
                .on("mouseup.drag", self.mouseup())
                .on("touchend.drag", self.mouseup());

            svg.call(d3.behavior.zoom().x(this.x).y(this.y).on("zoom", this.redraw()));
        });
    }

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
            templateUrl: 'partials/info.html',
            controller: InfoCtrl
        })


    ;

    socket.on('hello', function (data) {
        bootbox.alert(data.message);
    })

    $routeProvider.otherwise({redirectTo: '/'});

});


