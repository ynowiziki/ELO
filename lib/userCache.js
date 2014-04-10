//For heroku Redis To Go connection
var db;
if (process.env.REDISTOGO_URL) {
    db = require('redis-url').connect(process.env.REDISTOGO_URL);
} else {           //development environment
    db = require("redis").createClient();
}

exports.findByEmailOrSave = function(profile, fn){
    var ids = profile.id.split('/id?id=');
    if(ids.length > 1){
        var id = ids[1];
        var email, userID;
        db.keys("user:*", function(err, userList){
            for(var i in profile.emails){
                email = profile.emails[i].value;
                if(userList.indexOf('user:'+email)>=0){
                    userID = 'user:'+email;
                }
            }
            if(userID){
                db.hgetall(userID, function(err, user){
                    fn(null, user);
                })
            }
            else{
                db.hmset('user:'+email, 'id', id, 'dname', profile.displayName, 'fname', profile.name.familyName, 'gname', profile.name.givenName, 'email', email, function(err, ok){
                    db.hgetall('user:'+email, function(err, user){
                        fn(null, user);
                    })
                });
            }
        });
    }
};

exports.save = function(req, res){
    var user = req.body;
    var email = req.session.passport.user.email;
    res.setHeader('Content-Type', 'application/json; charset="utf-8"');
    if(user.nick){
        db.hmset("user:"+email, 'img', user.img, 'nick', user.nick, 'intro', user.intro, function(err, ok){
            if (err) {
                res.end(JSON.stringify({status : 'failed'}));
            }
            else {
                db.hgetall("user:"+email , function(err, user){
                    if (!err) {
                        req.session.passport.user = user;
                    }
                });
                res.end(JSON.stringify({status : 'ok'}));
            }
        });
    }
    else {
        res.end(JSON.stringify({status : 'failed'}));
    }
};
