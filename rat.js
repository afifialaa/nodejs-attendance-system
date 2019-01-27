var express = require('express');
var app = express();

var mysql = require('mysql');

var path = require('path');

var fs = require('fs');
var session = require('express-session');

var mysqlSync = require('sync-mysql');

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

var connection = new mysqlSync({
    host: 'localhost',
    user: '',
    password: '',
    database: "attendance_system"
});

var writeImagePromise = function(req){
    return new Promise(function(resolve, reject){
        console.log('body: ' + JSON.stringify(req.body.content));

        //base64 recieved without meta info
        image64 = JSON.stringify(req.body.content);

        //writing image to directory
        var path = 'D:\\attendance system\\shared\\test.png';
        fs.writeFile(path, image64, {encoding:'base64'}, function(err){
            if(err) throw err;
            console.log('written successfully');
            resolve();
        });
    });
}

function getDateTime(table, employeeID){

    //getting date
    var datetime = new Date();
    var recordedDate = datetime.toLocaleDateString();
    console.log('recorded date: ' + recordedDate);

    var recordedTime = datetime.toLocaleTimeString();
    console.log('recorded time ' + recordedTime);

    console.log('employee id recieved: ' + employeeID);

    insertDateTime(table, employeeID, recordedDate, recordedTime);
    //const insertDateTime = connection.query("INSERT INTO ?? (employee_id, day, time) VALUE (?, ?, ?)", [table, employeeID, recordedDate, recordedTime]);
}

// updating database
function insertDateTime(table, employeeID, recordedDate, recordedTime){
    con.query("INSERT INTO ?? (employee_id, day, time) VALUE (?,?,?)", [table, employeeID, recordedDate, recordedTime], function (err, result, fields) {
        if (err) {
            console.log('2)failed to insert in: ' + table);
            throw err;
        }
    });
}

var checkFilePromise = function(){
    return new Promise(function(resolve, reject){
        const timeout = setInterval(function(){
            const file = 'D:\\attendance system\\shared\\id.txt';
            const fileExists = fs.existsSync(file);
    
            console.log('Checking for: ', file);
            console.log('Exists: ', fileExists);
    
            if (fileExists) {
                clearInterval(timeout);
                resolve(file);
            }else{
                console.log('still waiting...');
            }
        }, 2000);
    });
}

var getFileContentDeparturePromise = function(file){
    return new Promise(function(resolve, reject){
        // reading employee id
        var employeeID = fs.readFileSync(file);
        fs.unlinkSync(file);

        // recording departure time
        var table = 'departure';
        getDateTime(table, employeeID);
        resolve(employeeID);
    });
}

var recordAttendancePromise = function(employeeID){
    return new Promise(function(resolve, reject){
        console.log('recording attendance for employee: ' + 1);

        // getting today's date
        var today = new Date();
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth() + 1;
        var todayDay = today.getDate();

        var arrivalHours;
        var arrivalMinutes;
        var arrivalSeconds;

        var departureHours;
        var departureMinutes;
        var departureSeconds;

        var workingHours;
        var workingMinutes;
        var workingSeconds;

        var tolerenceAmount;

        var date = '2019-1-25';
        console.log('setting time to: ' + date);

        // selecting time from arrival
        con.query("select time from arrival where employee_id = ? and day = ?", [1, date], function (err, arrivalResult, fields) {
            if (err) throw err;
            var arrival = arrivalResult[0].time;
            console.log('arrival time: ' + arrival);
            var arrivalArr = arrival.split(':');
            arrivalHours = arrivalArr[0];
            arrivalMinutes = arrivalArr[1];
            arrivalSeconds = arrivalArr[2];

            con.query('select time from departure where employee_id = ? and day = ?', [employeeID, date], function (err, departureResult) {
                if (err) throw err;
                var departure = departureResult[0].time;
                console.log('departure time: ' + departure);
                var departureArr = departure.split(':');
                departureHours = departureArr[0];
                departureMinutes = departureArr[1];
                departureSeconds = departureArr[2];

                con.query('select contract_id from employee where employee_id = ?', [employeeID], function (err, contract_id) {
                    if (err) throw err;
                    var contractID = contract_id[0].contract_id;

                    con.query('select tolerence from contract where contract_id = ?', [contractID], function (err, tolerence) {
                        if (err) throw err;
                        tolerenceAmount = tolerence[0].tolerence;

                        con.query('select workingHours from contract where contract_id = ?', [contractID], function (err, workingAmount) {
                            if (err) throw err;
                            var working =   workingAmount[0].workingHours;
                            console.log('working hours: ' + working);
                            var workingArr = working.split(':');
                            workingHours = workingArr[0];
                            workingMinutes = workingArr[1];
                            workingSeconds = workingArr[2];
                        });
                    });
                }); 
            });
        });

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
            con.query('insert into attendance (employee_id, arrival_id, departure_id, attendance_code) values (?, ?, ?, ?)', [employeeID, 25, 25, 'l'], function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
                resolve(employeeID);
            });
        }else{
            console.log('late');
            con.query('insert into attendance (employee_id, arrival_id, departure_id, attendance_code) values (?, ?, ?, ?)', [employeeID, 25, 25, 'l'], function (err, result) {
                if (err) throw err;
                resolve(employeeID);
                console.log("1 record inserted");
            });
        }

    });
}

app.get('/departure', function(req, res){
    res.render('pages/departurePage.html');
})

var getEmployeeDataPromise = function(employeeID){
    return new Promise(function(resolve, reject){
        con.query("SELECT * FROM employee where employee_id = " + employeeID, function (err, result, fields) {
            if (err) throw err;
            resolve(result);
        });
    });
}

// GET userPage
app.get('/userPage/:employeeID', function(req, res){
    getEmployeeDataPromise(req.params.employeeID).then(function(result){
        console.log(result);
        res.render('pages/userPage.html', {data:result[0]});
    })   
});

app.get('/test', function(req, res){
    var date = '2019-1-25';

    con.query("select time from arrival where employee_id = ? and day = ?", [1, date], function (err, arrivalResult, fields) {
        if (err) throw err;
        var arrival = arrivalResult[0].time;
        console.log('arrival time: ' + arrival);
        var arrivalArr = arrival.split(':');
        var arrivalHours = arrivalArr[0];
        var arrivalMinutes = arrivalArr[1];
        var arrivalSeconds = arrivalArr[2];
    });
    res.send('hello');
});

// POST departure request
app.post('/departure', function(req, res){
    writeImagePromise(req).then(function(){
        return checkFilePromise();
    }).then(function(result){
        return getFileContentDeparturePromise(result);
    }).then(function(result){
       return recordAttendancePromise(result);
    }).then(function(result){
        console.log('result recieved: ' + result);
        res.status(200).send({body:req.body, url:'http://localhost:8080/userPage/' + result});
    });
});


app.listen(8080, function(req, res){
    console.log('server is listening');
})