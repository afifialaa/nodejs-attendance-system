var express = require('express');
var app = express();

var bodyParser = require('body-parser');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res){
    res.render('pages/test.html');
});

app.post('/uploadAjax', function(req, res){
    req.on('data', function (chunk) {
        console.log('GOT DATA!');
    });

    var obj = {};
    obj.url = "https://www.google.com/"
    console.log('body: ' + JSON.stringify(req.body));
    res.status(200).send({body:req.body, url:'https://www.google.com/'});
});

app.post('/upload', function(req, res){
    
});

app.listen(8080, function(req, res){
    console.log('server is listening');
});

