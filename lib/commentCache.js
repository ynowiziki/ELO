var db;
if (process.env.REDISTOGO_URL) {
    db = require('redis-url').connect(process.env.REDISTOGO_URL);
} else {           //development environment
    db = require("redis").createClient();
}

function encode(text){
    return text.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

exports.save = function(req, res){
    var comment = req.body;
    res.setHeader('Content-Type', 'application/json; charset="utf-8"');
    db.incr('comment:ids', function(err, id){
        if (err) {
            res.end(JSON.stringify({status : 'failed'}));
        }
        else{
            db.hmset('comment:'+id, 'email', encode(comment.email), 'nick', encode(comment.nick), 'content', encode(comment.contnet),  function(err, ok){
                if (err) {
                    res.end(JSON.stringify({status : 'failed'}));
                }
                else {
                    res.end(JSON.stringify({status : 'ok'}));
                }
            });
        }
    });
};

exports.list = function(req, res){
    res.setHeader('Content-Type', 'application/json; charset="utf-8"');
    var allComments = [];
    db.keys("comment:*",function(err, commentList){
        if(err || commentList.length == 0) {
            res.end(JSON.stringify(allComments));
        }
        else{
            var total = 0;
            for(var i in commentList){
                db.hgetall(commentList[i], function(err, comment){
                    if (! err){
                        allComments.push(comment);
                    }
                    total ++;
                    if(total == commentList.length){
                        res.end(JSON.stringify(allComments));
                    }
                });
            }
        }
    });
}