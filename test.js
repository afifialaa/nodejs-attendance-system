var express = require('express');
var app = express();

var bodyParser = require('body-parser');

var mysql = require('mysql');

var fs = require('fs');

var mysqlSync = require('sync-mysql');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var step = require('step');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var con = mysql.createConnection({
    host: "localhost",
    user: "",
    password: "",
    database: "attendance_system"
});

var connection = new mysqlSync({
    host: 'localhost',
    user: '',
    password: '',
    database: "attendance_system"
});



app.get('/', function(req, res, next){
    res.render('pages/test.html');
});

app.listen(8080, function(req, res){

    const employeeID = 7;
    var date = '2019-1-25';

    // getting today's date
    var today = new Date();
    var todayYear = today.getFullYear();
    var todayMonth = today.getMonth() + 1;
    var todayDay = today.getDate();

    // selecting time from arrival
    const arrivalResult = connection.query('select time from arrival where employee_id = ? and day = ?', [employeeID, date]);
    var arrival = arrivalResult[0].time;
    console.log('arrival time: ' + arrival);
    var arrivalArr = arrival.split(':');
    var arrivalHours = arrivalArr[0];
    var arrivalMinutes = arrivalArr[1];
    var arrivalSeconds = arrivalArr[2];

    //selecting time from departure
    const departureResult = connection.query('select time from departure where employee_id = ? and day = ?', [employeeID, date]);
    var departure = departureResult[0].time;
    console.log('departure time: ' + departure);
    var departureArr = departure.split(':');
    var departureHours = departureArr[0];
    var departureMinutes = departureArr[1];
    var departureSeconds = departureArr[2];

    // selecting contract id from employee
    const contract_id = connection.query('select contract_id from employee where employee_id = ?', [employeeID]);
    var contractID = contract_id[0].contract_id;
    
    // selecting working hours from contract
    const tolerence = connection.query('select tolerence from contract where contract_id = ?', [contractID]);
    var tolerenceAmount = tolerence[0].tolerence;

    // selecting wokring hours
    const workingAmount = connection.query('select workingHours from contract where contract_id = ?', [contractID]);
    var working =   workingAmount[0].workingHours;
    console.log('working hours: ' + working);
    var workingArr = working.split(':');
    var workingHours = workingArr[0];
    var workingMinutes = workingArr[1];
    var workingSeconds = workingArr[2];

    // setting start of day
    const start = '08:00:00';
    var startArr = start.split(':');
    var startHours = startArr[0];
    var startMinutes = startArr[1];
    var startSeconds = startArr[2];

    // setting dates to be able to do operations
    const arrivalDate = new Date(todayYear, todayMonth, todayDay, arrivalHours, arrivalMinutes, arrivalSeconds);
    const departureDate = new Date(todayYear, todayMonth, todayDay, departureHours, departureMinutes, departureSeconds);
    const workingAmountDate = new Date(todayYear, todayMonth, todayDay, workingHours, workingMinutes, workingSeconds);
    const startDate = new Date(todayYear, todayMonth, todayDay, startHours, startMinutes, startSeconds);

    // calculating difference in time
    const diffDate = new Date(departureDate - arrivalDate);
    var diffHours = diffDate.getHours();
    var diffMinutes = diffDate.getMinutes();
    var diffSeconds = diffDate.getSeconds();
    var diffTime = diffDate.toLocaleTimeString();
    console.log('difference is: ' + diffTime);

    startDate.setMinutes(startDate.getMinutes() + tolerenceAmount);
    console.log(startDate.toLocaleTimeString());
    console.log('arrival is: ' + arrivalDate.toLocaleTimeString());

    if(startDate.toDateString() < arrivalDate.toLocaleTimeString()){
        console.log('ontime');
        const insertAttendance = connection.query('insert into attendance (employee_id, arrival_id, departure_id, attendance_code) values (?, ?, ?, ?)', [employeeID, 1, 1, 'o']);
    }else{
        console.log('late');
        const insertAttendance = connection.query('insert into attendance (employee_id, arrival_id, departure_id, attendance_code) values (?, ?, ?, ?)', [employeeID, 25, 25, 'l']);
    }

    
});

