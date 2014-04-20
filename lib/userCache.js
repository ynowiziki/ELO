//For heroku Redis To Go connection
var db;
if (process.env.REDISTOGO_URL) {
    db = require('redis-url').connect(process.env.REDISTOGO_URL);
} else {           //development environment
    db = require("redis").createClient();
}

exports.list = function(fn){
    db.keys("user:*", function(err, userList){       //redis: list all keys
        if(err) {
            fn(err, null);
        }
        else {
            for(var i in userList){
                var userID = userList[i];
                db.hgetall(userID, function(err, user){  //get a user profile
                    fn(null, user);
                })
            }
        }
    })
};
