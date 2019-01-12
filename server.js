var express = require('express');
var app = express();

var mysql = require('mysql');

var fs = require('fs');
var session = require('express-session');

var bodyParser = require('body-parser');
var session = require('express-session');

/*** end of importing ****/

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({secret: "Shh, its a secret!"}));

var con = mysql.createConnection({
    host: "localhost",
    user: "",
    password: "",
    database: "attendance_system"
});

var result = [];

function save(records){
    result = records;
    console.log('hello from saveCallback');
}

function getEmployeeData(empID, callback){
    con.connect(function(err) {
        if (err) throw err;
        console.log('connected to database');
        con.query("SELECT * FROM employee where employee_id = " + empID, function (err, result, fields) {
            if (err) throw err;
            callback(result);
        });
    });
}

app.get('/', function(req, res){
    console.log('a client is connected...');
    res.render('pages/index.html');
});

app.get('/test', function(req, res){
    res.render('pages/test.html');
});

app.post('/upload', function(req, res){
    req.on('data', function (chunk) {
        console.log('GOT DATA!');
    });

    var obj = {};
    obj.url = "https://www.google.com/"
    console.log('body: ' + JSON.stringify(req.body));
    res.status(200).send({body:req.body, url:'https://www.google.com/'});
});

// var img64 = req.body.img;
    // console.log(img64);

    // var empID = 1;
    // req.session.employeeID = empID;
    // console.log('session is set for employee: ' + req.session.employeeID);

    // getEmployeeData(req.session.employeeID, function(records){
    //     result = records;
    //     req.session.email = result[0].email;
    //     console.log('from getEmployeeData, session email is:' + req.session.email);
    // });



app.listen(8080, function(){
    console.log('server is running at port ' + 8080);
});