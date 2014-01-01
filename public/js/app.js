var app = angular.module('app', [
    'ngRoute',
    'route-segment',
    'view-segment',
    'ngAnimate'
]);
var task_id_gen = 0;
app.directive('autoFocus', function () {
    return {
        restrict: 'AC',
        link: function (_scope, _element) {
            _element[0].focus();
        }
    };
});

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13 && event.metaKey == false) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

app.directive('keyPressed', function () {
    return function (scope, element, attrs) {

        element.bind("keydown keypress", function (event) {

            if (event.which === 13 ) {

                if (event.metaKey) {
                    scope.addChild();
                } else if (event.shiftKey) {
                    element.parent().parent().scope().addAfter();
                } else {
                    scope.addAfter();
                }

                event.preventDefault();
            } else if (event.keyCode === 186) { // ':'
                // add a new subject
                var subjectName = scope.task.name.trim();
                if (subjectName == 'f') {
                    var profile = {
                        imageUrl: 'images/user.png',
                        className: 'task-feature'
                    }
                    scope.task.profile = profile;
                    scope.task.name = '';
                    scope.$apply();
                    event.preventDefault();
                } else if (subjectName == 'c') {
                    var profile = {
                        imageUrl: 'images/coding.png',
                        className: 'task-coding'
                    }
                    scope.task.profile = profile;
                    scope.task.name = '';
                    scope.$apply();
                    event.preventDefault();
                }

            } else if (event.keyCode === 8) { // backspace
                if (scope.task.name == '') {
                    if (scope.task.subjects.length > 0) {
                        scope.task.subjects.pop();
                        scope.$apply();
                    } else {
                        // no scope, delete task if it has no children
                        if (scope.task.children.length == 0) {
                            scope.deleteSelf();
                        }
                    }

                }
            } else if (event.keyCode === 46) {

            }

        });
    };
});

function NavCtrl($scope, $routeSegment) {
    $scope.$routeSegment = $routeSegment;
}


app.factory('RecursionHelper', ['$compile', function ($compile) {
    var RecursionHelper = {
        compile: function (element) {
            var contents = element.contents().remove();
            var compiledContents;
            return function (scope, element) {
                if (!compiledContents) {
                    compiledContents = $compile(contents);
                }
                compiledContents(scope, function (clone) {
                    element.append(clone);
                });
            };
        }
    };

    return RecursionHelper;
}]);

app.directive('task', ['$timeout', 'RecursionHelper', '$compile', function ($timeout, RecursionHelper, $compile) {
    return {
        restrict: 'E',
        scope: {task: '=', parent: '=', index: '='},
        templateUrl: '/partials/task.html',
        replace: true,
        compile: function (element) {
            var contents = element.contents().remove();
            var compiledContents;
            return function (scope, elm) {

                if (!compiledContents) {
                    compiledContents = $compile(contents);
                }

                compiledContents(scope, function (clone) {
                    elm.append(clone);
                });

                scope.addChild = function () {
                    scope.task.children.push(createTask('', scope.task));
                    scope.collapsed = false;
                    scope.$apply();
                }
                scope.toggle = function() {
                    scope.collapsed = ! scope.collapsed;
                }
                scope.addChildAfter = function (index) {
                    if (index + 1 >= scope.task.children.length) {
                        scope.task.children.push(createTask('', scope.task));
                    } else {
                        scope.task.children.splice(index + 1, 0, createTask('', scope.task)).join();
                    }
                }
                scope.getBackground = function() {
                    return scope.task.children.length > 0 ? '#1f1f1f' : '#5E5E5E';
                }
                scope.deleteChild = function(task, index) {
                    scope.task.children.splice(index, 1);
                    scope.$apply();
                }

                scope.deleteSelf = function() {
                    elm.parent().scope().deleteChild(scope.task, scope.index);
                    elm.parent().scope().taskChanged();
                }

                scope.addAfter = function () {
                    elm.parent().scope().addChildAfter(scope.index);
                    scope.$apply();
                }

                scope.taskChanged = function() {
                    updateEffort(scope.task);
                    socket.emit('update_task', scope.task);
                    elm.parent().scope().taskChanged();
                }




            };

        }
    };
}]);

function updateEffort(task) {
    if (task.children.length > 0) {
        task.effort = 0;
        for (var i = 0; i < task.children.length; i++) {
            if (task.children[i].effort && task.children[i].effort != '') {
                task.effort += eval(task.children[i].effort);
            }
        }
    }
}
function TasksCtrl($timeout, $scope, $routeSegment) {
    $scope.$routeSegment = $routeSegment;
    $scope.tasks = [];


    $scope.init = function() {
        $scope.loadAllTasks();
    }

    $scope.loadAllTasks = function() {
        $timeout(function() {
            $scope.tasks = [];
            socket.emit('get_all_tasks', null, function(data) {
                for (var i = 0; i < data.length; i++) {
                    $scope.tasks.push(data[i]);
                }
                $scope.$apply();
            })
        });
    }

    $scope.addChild = function () {
        $scope.tasks.push(createTask('', $scope));
    }

    $scope.inc = function () {
        $scope.count = $scope.count + 1;

    }
    $scope.addTask = function () {
        $scope.tasks.push({ name: '' })

    }
    $scope.keyPressed = function (task) {
        console.log("key pressed");
    }

    $scope.deleteChild = function(task, taskIndex) {
        var id = task._id;
        socket.emit('delete_task', id, function(err) {
            if (! err) {
                $scope.tasks.splice(taskIndex, 1);
                $scope.$apply();
            }
        });
    }
    $scope.taskChanged = function() {

    }
    $scope.addTaskAfter = function (index) {
        $scope.tasks.insert(index, { name: 'another one'});
    }
    $scope.addChildAfter = function (index) {
        var newTask = createTask('', $scope);
        socket.emit('add_task', newTask, function(err, updatedTask) {
            if (!err) {
                if (index + 1 < $scope.tasks.length) {
                    $scope.tasks.splice(index + 1, 0, updatedTask).join();
                } else {
                    $scope.tasks.push(updatedTask);
                }
                $scope.$apply();
            }
        });

    }
}

function createTask(name, parent) {
    return {
        id: task_id_gen++,
        name: name,
        subjects: [],
        children: [],
        profile: {
            className: "task-default"
        }
    }
}


function createSubject(name, imageUrl, className) {
    return {
        name: name,
        imageUrl: imageUrl,
        className: className
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


