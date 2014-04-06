
function authenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send(401);
}
var User = require('./lib/userCache');
var express = require('express')
    , http = require('http')
    , path = require('path');

var redis = require('redis');
var db = redis.createClient();
var app = express();

var passport = require('passport')
    , GoogleStrategy = require('passport-google').Strategy;

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
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/test', authenticated, function(req, res) {
    console.log('server side auth test passed');
    res.end(JSON.stringify(req.user));
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new GoogleStrategy({
        returnURL: 'http://localhost:3000/auth/google/return',
        realm: 'http://localhost:3000/'
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
        // Successful authentication, redirect home.
        res.redirect('/');
    });

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});