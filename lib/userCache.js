//For heroku Redis To Go connection
var db;
var userStore = new Object();

if (process.env.REDISTOGO_URL) {
//    db = require('redis-url').connect(process.env.REDISTOGO_URL);
} else {           //development environment
    console.log('dev redis server');
//    db = require("redis").createClient();

}
//
//var redis = require('redis')
//    , bcrypt = require('bcrypt')
//    , db = redis.createClient(); // create long-running redis connection
module.exports = User; // export User function from the module

function User(obj) {
    for (var key in obj) { // iterate keys in the object passed
        this[key] = obj[key]; // merge values
    }
}

User.findByEmailOrSave = function(profile, fn){
    var ids = profile.id.split('/id?id=');
    var id = 'na';
    if(ids.length > 1){
        id = ids[1];
    }
    var email = profile.emails[0].value;
    if (process.env.REDISTOGO_URL) {
        db.exists(email, function(err, exist){
            if(err || !exist) {
                db.hmset(email, 'id', id, 'dname', profile.displayName, 'fname', profile.name.familyName, 'gname', profile.name.givenName, 'email', email, function(err, ok){
                    db.hgetall(email, function(err, user){
                        fn(null, user);
                    })
                });
            }
            else{
                db.hgetall(email, function(err, user){
                    fn(null, user);
                })
            }
        });
    }
    else {
        if(! userStore[email]){
            userStore[email] = {'id': id, 'dname': profile.displayName, 'fname':profile.name.familyName, 'gname': profile.name.givenName, 'email': email};
        }
        console.log(userStore[email]);
        fn(null, userStore[email]) ;
    }

};
