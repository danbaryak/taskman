
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongo = require('mongoskin');
var db = mongo.db('mongodb://localhost:27017/tasks', { safe: false });

var tasks = db.collection('tasks');

var app = express();

app.set('port', process.env.PORT || 3050);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function(socket) {
    console.log('connected');

    socket.on('add_task', function(task, cb) {
        tasks.insert(task, function(err, tasks) {
            cb(err, err ? null : tasks[0]);
        });
    });

    socket.on('update_task', function(task) {
        var id = task._id;
        delete task._id;
        tasks.updateById(id, { $set: { name: task.name, profile: task.profile, children: task.children, effort: task.effort} }, function(err, task) {
            console.log('saved');
        });
    })

    socket.on('get_all_tasks', function(data, cb) {
        tasks.find().toArray(function(err, tasks) {
            cb(tasks);
        });
    })
    socket.on('delete_task', function(id, cb) {
       tasks.removeById(id, function(err) {
          cb(err);
       });
    });

});

