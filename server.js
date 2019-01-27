var express = require('express');
var app = express();

var mysql = require('mysql');

var path = require('path');

var fs = require('fs');
var session = require('express-session');

var bodyParser = require('body-parser');
var session = require('express-session');

var mysqlSync = require('sync-mysql');

/*** end of importing ****/

/*************************/
/*** global variables ***/

var image64;

/*** end of global variables ***/
/*************************/

// view engine setup
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "/public")));
app.engine('html', require('ejs').renderFile);

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({secret: "Shh, its a secret!"}));

// database connection setup
var con = mysql.createConnection({
    host: "localhost",
    user: "",
    password: "",
    database: "attendance_system"
});

// synchronous connection to database
var connection = new mysqlSync({
    host: 'localhost',
    user: '',
    password: '',
    database: "attendance_system"
});

// database connection
con.connect(function(err){
    if(err) console.log(err);
    console.log('connected to database');
});

// recording date and time
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

//write image to directory  
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

// checking if file exists
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

// reading contents of id.txt
// when arriving -> arrival table
var getFileContentPromise = function(file){
    return new Promise(function(resolve, reject){

        // reading employee id
        var employeeID = fs.readFileSync(file);
        fs.unlinkSync(file);

        // recording arrival time
        var table = 'arrival';
        getDateTime(table, employeeID);
        resolve(employeeID);
    });
}

// when departuring -> departure table
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


// getting employee data from db
var getEmployeeDataPromise = function(employeeID){
    return new Promise(function(resolve, reject){
        con.query("SELECT * FROM employee where employee_id = " + employeeID, function (err, result, fields) {
            if (err) throw err;
            resolve(result);
        });
    });
}

// checking if id and password matches db
//emploeeid is in function scope
var employeeSigninPromise = function (employeeID, password){
    return new Promise(function(resolve, reject){
        sql = "SELECT * FROM employee where employee_id = ? and password = ?";
        con.query(sql, [employeeID, password], function (err, result, fields) {
            if (err) throw err;
            if(result.length == 1){
                // record time
                var table = 'arrival';
                getDateTime(table, employeeID);
                resolve(result);
            }
        });
    });
}

// record attendance for employee
var recordAttendancePromise = function(employeeID){
    return new Promise(function(resolve, reject){
        console.log('recording attendance for employee: ' + 1);

        // getting today's date
        var today = new Date();
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth() + 1;
        var todayDay = today.getDate();

        var date = '2019-1-25';
        console.log('setting time to: ' + date);

        // selecting time from arrival
        const arrivalResult = connection.query('select time from arrival where employee_id = ? and day = 2019-01-25', [employeeID]);
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

        if(insertAttendance)
            resolve(employeeID);
        else
            reject('rejected');

    });
}

app.get('/', function(req, res){
    console.log('a client is connected...');
    res.render('pages/index.html');
});

// GET signin
app.get('/signin', function(req, res){
    res.render('pages/signin.html');
});

// POST signin
app.post('/signin', function(req, res){
    var employeeID = req.body.employeeID;
    var password = req.body.password;
    employeeSigninPromise(employeeID, password).then(function(result){
        res.render('pages/userPage.html', {data:result[0]});
    })
});

// GET userPage
app.get('/userPage/:employeeID', function(req, res){
    getEmployeeDataPromise(req.params.employeeID).then(function(result){
        console.log(result);
        res.render('pages/userPage.html', {data:result[0]});
    })   
});

// testing
app.get('/userPage', function(req, res){
    console.log('userPage requested');
    res.render('pages/user/userPage.html');
});

// testing page
app.get('/test', function(req, res){
    res.render('pages/test.html');
});

// POST request -> uploading image -> recieving id
app.post('/upload', function(req, res){
    writeImagePromise(req).then(function(){
        return checkFilePromise();
    }).then(function(result){
        return getFileContentPromise(result);
    }).then(function(result){
        res.status(200).send({body:req.body, url:'http://localhost:8080/userPage/' + result});
    })
});

// GET departure request
app.get('/departure', function(req, res){
    res.render('pages/departurePage.html');
})

// POST departure request
app.post('/departure', function(req, res){
    writeImagePromise(req).then(function(){
        return checkFilePromise();
    }).then(function(result){
        return getFileContentDeparturePromise(result);
    }).then(function(result){
       return recordAttendancePromise(result);
    }).then(function(result){
        res.send('signed out');
    });
});

// searching for an employee
app.get('/search', function(req, res){
    res.render('pages/search.html');
});

app.post('/search', function(req, res){

});

app.listen(8080, function(){
    console.log('server is running at port ' + 8080);
});