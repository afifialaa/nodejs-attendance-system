var express = require('express');
var app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res){
    res.render('pages/test.html');
});

app.post('/uploadAjax', function(){
    res.render('pages/trial.html');
});

app.post('/upload', function(req, res){
    console.log('upload is requested');
    res.json({status:"success", redirect:'https://www.google.com'});
});

app.listen(8080, function(req, res){
    console.log('server is listening');
});

