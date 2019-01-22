var express = require('express');
var app = express();

var mysql = require('mysql');

var path = require('path');

var fs = require('fs');
var session = require('express-session');

var bodyParser = require('body-parser');
var session = require('express-session');

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

// recording date and time
function getArrivalDateTime(employeeID){
    //getting date
    var datetime = new Date();
    var year = datetime.getFullYear();
    var month = datetime.getMonth()+1;
    var day = datetime.getDate();
    var arrivalDate = [year, month, day].join('-');
    console.log(arrivalDate);

    //getting time
    var hours = datetime.getHours();
    var minutes = datetime.getMinutes();
    var seconds = datetime.getSeconds();
    var arrivalTime = [hours, minutes, seconds].join(':');
    console.log(arrivalTime);
    insertArrival(employeeID, arrivalDate, arrivalTime);
}

// updating database
function insertArrival(employeeID, arrivalDate, arrivalTime){
    con.connect(function(err) {
        if (err) {
            console.log('failed to insert arrival 1');
            throw err;
        }
        console.log('connected to database');
        con.query("INSERT INTO arrival (employee_id, day, time) VALUE (?,?,?)", [employeeID, arrivalDate, arrivalTime], function (err, result, fields) {
            if (err) {
                console.log('failed to insert in arrival 2');
                throw err;
            }
        });
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
var getFileContentPromise = function(file){
    return new Promise(function(resolve, reject){
        // reading employeeid
        var content = fs.readFileSync(file);
        var employeeID = content;

        // recording arrival time
        getArrivalDateTime(employeeID);
        resolve(employeeID);
    });
}

// getting employee data from db
var getEmployeeDataPromise = function(employeeID){
    return new Promise(function(resolve, reject){
        // con.connect(function(err) {
        //     if (err) throw err;
        //     console.log('connected to database');
            con.query("SELECT * FROM employee where employee_id = " + employeeID, function (err, result, fields) {
                if (err) throw err;
                resolve(result);
            });
        // });
    });
}

// checking if id and password matches db
//emploeeid is in function scope
var employeeSigninPromise = function (employeeID, password){
    return new Promise(function(resolve, reject){
        con.connect(function(err) {
            if (err) throw err;
            console.log('connected to database');
            sql = "SELECT * FROM employee where employee_id = ? and password = ?";
            con.query(sql, [employeeID, password], function (err, result, fields) {
                if (err) throw err;
                if(result.length == 1){
                    // record attendance
                    getArrivalDateTime(employeeID);
                    resolve(result);
                }
            });
        });
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

// POST request -> uploading image
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
    res.render('pages/departure.html');
})

// POST departure request
app.post('/departure', function(req, res){
    writeImagePromise(req).then(function(){
        return checkFilePromise();
    }).then(function(result){
        return getFileContentPromise(result);
    }).then(function(result){
        res.status(200).send({body:req.body, url:'http://localhost:8080/userPage/' + result});
    })
})


app.listen(8080, function(){
    console.log('server is running at port ' + 8080);
});