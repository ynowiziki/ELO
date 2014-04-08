var db;
if (process.env.REDISTOGO_URL) {
    db = require('redis-url').connect(process.env.REDISTOGO_URL);
} else {           //development environment
    db = require("redis").createClient();
}

exports.save = function(req, res){
    var comment = req.body;
    var email = req.session.passport.user.email;
    res.setHeader('Content-Type', 'application/json; charset="utf-8"');
    db.incr('comments:ids', function(err, id){
        if (err) {
            res.end(JSON.stringify({status : 'failed'}));
        }
        else{
            db.keys("comment:"+email+":*",function(err, commentList){
                if(commentList.length < 1000){      //maximum 1000 comments for each user
                    db.hmset('comment:'+email +':'+id, 'email', email, 'nick', comment.nick.substring(0, 200), 'content', comment.content.substring(0, 2000), 'date', new Date(), function(err, ok){
                        if (err) {
                            res.end(JSON.stringify({status : 'failed'}));
                        }
                        else {
                            res.end(JSON.stringify({status : 'ok'}));
                        }
                    });
                }
                else{
                    res.end(JSON.stringify({status : 'Too many comments.'}));
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
                        comment.date = Date.parse(comment.date);
                        allComments.push(comment);
                    }
                    total ++;
                    if(total == commentList.length){
                        allComments.sort(function(a, b) {
                            var x = a.date;
                            var y = b.date;
                            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
                        });
                        res.end(JSON.stringify(allComments));
                    }
                });
            }
        }
    });
}