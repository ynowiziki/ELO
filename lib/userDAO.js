var uri;
if (process.env.MONGOLAB_URI) {
    uri = process.env.MONGOLAB_URI;
} else {           //development environment
    uri = 'mongodb://127.0.0.1:27017/studyColony';
}

var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
var collection;
MongoClient.connect(uri, function(err, db) {
    if(err) throw err;
    collection = db.collection('test_insert');
})

exports.insert = function(req, res){
    console.log('insert');
    res.setHeader('Content-Type', 'application/json; charset="utf-8"');
    collection.insert({a:2}, function(err, docs) {

        collection.count(function(err, count) {
            console.log(format("count = %s", count));
        });

        // Locate all the entries using find
        collection.find().toArray(function(err, results) {
            console.log(results);
            res.end(JSON.stringify(results));
            // Let's close the db
//            db.close();
        });
    });
}
