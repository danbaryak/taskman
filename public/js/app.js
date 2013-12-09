var app = angular.module('app', [
    'ngRoute',
    'route-segment',
    'view-segment',
    'ngAnimate'
]);

function NavCtrl($scope, $routeSegment) {
    $scope.$routeSegment = $routeSegment;
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
                .on("mouseup.drag",   self.mouseup())
                .on("touchend.drag",  self.mouseup());

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


