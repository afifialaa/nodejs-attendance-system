var express = require('express');
var app = express();

var mysql = require('mysql');

var fs = require('fs');
var session = require('express-session');

var bodyParser = require('body-parser');
var session = require('express-session');

//control flow module
var step = require('step');

/*** end of importing ****/

//declaring middlewares
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
var employeeID;

function save(records){
    result = records;
    console.log('hello from saveCallback');
}

//retrieve employee data from db
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

//callback function to 
function readId(file){
    fs.readFile(file, function (err, data) {
        if (err) throw err;
        console.log('id form text file is ' + data);
        employeeID = data;
        console.log('employee id var is to: ' + employeeID);
    });
}

//
function getFile(callback){
    const timeout = setInterval(function(){
        const file = 'D:\\attendance system\\shared\\id.txt';
        const fileExists = fs.existsSync(file);

        console.log('Checking for: ', file);
        console.log('Exists: ', fileExists);

        if (fileExists) {
            clearInterval(timeout);
            callback(file);
        }else{
        }
    }, 5000);
};

app.get('/', function(req, res){
    console.log('a client is connected...');
    res.render('pages/index.html');
});

app.get('/userPage', function(req, res){
    console.log('userPage requested');
    res.render('pages/user/userPage.html');
})

app.get('/userPage/:employeeID', function(req, res){
    console.log('employee id recieved as a param is: ' + req.params.employeeID);
});

app.get('/test', function(req, res){
    res.render('pages/test.html');
});

//image is posted
app.post('/upload', function(req, res){
    step(
        function writeImage(){
            console.log('body: ' + JSON.stringify(req.body.content));

            //base64 recieved without meta info
            var image64 = JSON.stringify(req.body.content);

            //writing image to directory
            var path = 'D:\\attendance system\\shared\\test.png';
            fs.writeFile(path, image64, {encoding:'base64'}, function(err){
                if(err) console.log('an error occurred');
            });
        },
        function
    )
    

    //wait for matlab response
    getFile(readId);

    if(employeeID == 2){
        res.status(200).send({body:req.body, url:'http://localhost:8080/userPage/' + employeeID});
    }else{
        res.send('sorry');
    }
    
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