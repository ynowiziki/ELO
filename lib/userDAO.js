//This is a mock User class at this moment

var redis = require('redis')
    , bcrypt = require('bcrypt')
    , db = redis.createClient(); // create long-running redis connection
module.exports = User; // export User function from the module

function User(obj) {
    for (var key in obj) { // iterate keys in the object passed
        this[key] = obj[key]; // merge values
    }
}

User.findByOpenID = function(kv, fn){
    console.log(kv);
    fn(null, kv);
};
