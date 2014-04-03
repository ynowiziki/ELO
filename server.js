function authenticated(req, res, next) {
    if(req.session.urole){
        next();
    }
    else{
//        res.send(401);
        res.sendfile('public/login.html');
    }
}

var express = require('express')
    , http = require('http')
    , path = require('path');

var redis = require('redis');
var db = redis.createClient();
var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser("LMN"));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});


app.use(function(req, res, next){
    var ua = req.headers['user-agent'];
    db.zadd('online', Date.now(), ua, next);
});

app.use(function(req, res, next){
    var min = 60 * 1000;
    var ago = Date.now() - min;       //user count in the recent minute
    db.zrevrangebyscore('online', '+inf', ago, function(err, users){
        if (err) return next(err);
        req.online = users;
        next();
    });
});


app.get('/', authenticated, function(req, res) {
    res.sendfile('public/index.html');
    // load the single view file (angular will handle the page changes on the front-end)
});


var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});