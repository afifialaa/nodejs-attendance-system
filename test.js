var express = require('express');
var app = express();

var bodyParser = require('body-parser');

var fs = require('fs');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var step = require('step');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var employeeId;

app.get('/', function(req, res, next){
    res.render('pages/test.html');
});

app.get('/api/:id', function(req, res){
    res.send('hello ' + req.params.id);
});

app.get('/upload', function(req, res){
    step(
        function readPaper(rat){
            console.log(rat);
            const file = 'D:\\attendance system\\shared\\id.txt';
            fs.readFile(file, this);
        },
        function getUserData(err, data){
            if(err) throw err;
            console.log('data recieved is: ' + data);
            return data;
        },
        function getUserPage(err, data){
            if(err) throw err;
            console.log('getUserPage');
            employeeId = data;
            console.log('employeeId is set to ' + employeeId);
            res.send('data rendered is '+ data)
        }
    );
});

app.get('hello', function(req, res){
    res.send('hello');
});

app.listen(8080, function(req, res){
    console.log('server is listening');
});

