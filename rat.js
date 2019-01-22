var express = require('express');
var app = express();

var mysql = require('mysql');

var path = require('path');

var fs = require('fs');
var session = require('express-session');

var bodyParser = require('body-parser');
var session = require('express-session');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "/public")));
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

app.get('/', function(req, res){
    res.render('pages/signin.html');
});

app.listen(8080, function(req, res){
    var table = 'arrival';
    var date = '2019-1-23';
    var time = '11:03:00';
    con.connect(function(err) {
        console.log('connected to db');
        if (err) {
            console.log('failed to insert arrival 1');
            throw err;
        }
        con.query("INSERT INTO ?? (employee_id, day, time) VALUE (?,?,?)", [table, 1, date, time], function (err, result, fields) {
            if (err) {
                console.log('failed to insert in ' + table);
                throw err;
            }
        });
    });
})