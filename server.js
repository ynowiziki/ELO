
function authenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.send(401);
}

var express = require('express')
    , http = require('http')
    , path = require('path');

var redis = require('redis');
var db = redis.createClient();
var app = express();


var passport = require('passport')
    , YahooStrategy = require('passport-yahoo').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new YahooStrategy({
        returnURL: 'http://localhost:3000/auth/yahoo/return',
        realm: 'http://localhost:3000/'
    },
    function(identifier, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Yahoo profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Yahoo account with a user record in your database,
            // and return that user instead.
            profile.identifier = identifier;
            req.session.user = identifier.email;
            console.log(identifier);
            return done(null, profile);
        });
    }
));

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
//    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
//    app.use(express.static(path.join(__dirname, 'public')));
//    app.use(express.urlencoded());
//    app.use(express.methodOverride());
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
console.log(path.join(__dirname, 'public'));
app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


//app.use(function(req, res, next){
//    var ua = req.headers['user-agent'];
//    db.zadd('online', Date.now(), ua, next);
//});
//
//app.use(function(req, res, next){
//    var min = 60 * 1000;
//    var ago = Date.now() - min;       //user count in the recent minute
//    db.zrevrangebyscore('online', '+inf', ago, function(err, users){
//        if (err) return next(err);
//        req.online = users;
//        next();
//    });
//});



app.get('/test', authenticated, function(req, res) {
    console.log('server side test');
    res.end('<h1>authed!</h1>');
    // load the single view file (angular will handle the page changes on the front-end)
});

// GET /auth/yahoo
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Yahoo authentication will involve redirecting
//   the user to yahoo.com.  After authenticating, Yahoo will redirect the
//   user back to this application at /auth/yahoo/return
app.get('/auth/yahoo',
    passport.authenticate('yahoo', { failureRedirect: '/401' }),
    function(req, res) {
        res.redirect('/');
    });

// GET /auth/yahoo/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/yahoo/return',
    passport.authenticate('yahoo', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/');
    });

var server = app.listen(3003, function() {
    console.log('Listening on port %d', server.address().port);
});