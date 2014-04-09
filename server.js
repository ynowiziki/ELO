
function authenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send(401);
}
var User = require('./lib/userCache');
var Comment = require('./lib/commentCache');
var express = require('express')
    , http = require('http')
    , path = require('path');

//var redis = require('redis');
//var db = redis.createClient();
var app = express();

var passport = require('passport')
    , GoogleStrategy = require('passport-google').Strategy;

var port = Number(process.env.PORT || 5000);
var baseUrl = "http://localhost:"+port+'/';
if (process.env.REDISTOGO_URL) {
    baseUrl = "http://www.studycolony.com/";
}
app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser("LMN"));
    app.use(express.session({ secret: 'keyboard cat' }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.compress());
    app.use(app.router);

    app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
    console.log('================ development environment ================');
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.get('/userInfo', authenticated, function(req, res) {
    res.setHeader('Content-Type', 'application/json; charset="utf-8"');
    res.end(JSON.stringify(req.session.passport.user));
});
app.get('/listComments', authenticated, Comment.list);
app.post('/saveComment', authenticated, Comment.save);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new GoogleStrategy({
        returnURL: baseUrl+ 'auth/google/return',
        realm: baseUrl
    },
    function(identifier, profile, done) {
        profile.id = identifier;
        User.findByEmailOrSave(profile, function (err, user) {
            return done(err,user);
        });
    }
));

app.get('/auth/google',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/');
    });
app.get('/auth/google/return',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
//        req.session.user = user;
        // Successful authentication, redirect home.
        res.redirect('/');
    });

var server = app.listen(port, function() {
    console.log('I am Listening on port %d', server.address().port);
});