var express = require('express');
var app = express();


var promise = new Promise(function(resolve, reject){
    var x = 5;
    if(x==5){
        console.log('x is: ' + x);
        resolve(x);
    }else{
        console.log('error occured');
        reject('not a number');
    }
});

app.get('/', function(req, res){
    // promise.then(
    //     function(x){
    //         console.log('then executed');
    //         res.send("hello from home " + x);
    //     },
    //     function(err){
    //         console.log(err);
    //     }
    // );    
});

app.listen(8080, function(req, res){
    console.log('server is listening at port: ' + 8080);
})