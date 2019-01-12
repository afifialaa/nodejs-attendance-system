// var express = require('express');
// var router = express.Router();

// var fs = require('fs');
// var session = require('express-session');
// var userSession = require('./userSession');
// var mysql = require('mysql');
// var base64ToImage = require('base64-to-image');
// var base64Img = require('base64-img');
// //end of imports

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "",
//     password: "",
//     database: "attendance_system"
// });

// var result = [];

// function save(records){
//     result = records;
//     console.log('hello from saveCallback');
// }

// function getEmployeeData(empID, callback){
//     con.connect(function(err) {
//         if (err) throw err;
//         console.log('connected to database');
//         con.query("SELECT * FROM employee where employee_id = " + empID, function (err, result, fields) {
//             if (err) throw err;
//             callback(result);
//         });
//     });
// }




// //POST request of base64 encoding
// router.post('/upload', function(req, res){
//     var img64 = req.body.img;
//     console.log(img64);

//     var empID = 1;
//     req.session.employeeID = empID;
//     console.log('session is set for employee: ' + req.session.employeeID);

//     getEmployeeData(req.session.employeeID, function(records){
//         result = records;
//         req.session.email = result[0].email;
//         console.log('from getEmployeeData, session email is:' + req.session.email);
//     });

//     console.log('upload invoked');
//     res.render('pages/test.html');
//     console.log(res);



//     //***base64 string to image***/
//     //using base64-to-image
//     /*var base64Str = img64;    
//     var path = 'D:/project/shared/';
//     var optionalObj = {'fileName': 'test', 'type':'jpeg'};
//     var imageInfo = base64ToImage(base64Str,path,optionalObj); 
//     console.log('name of the save image is: ' + imageInfo.fileName);*/

//     /** base64 string to image***/
//     //using base64-img
//     /*base64Img.img(img64, 'D:/project/shared/', 'test', function(err, filepath) {
//         if(err) console.log('failed to convert image'); 
//         console.log('image saved');
//     });*/



//     //writing base64 string to shared dir
//     // /fs.writeFile('D:/project/shared/base64encoding.txt', img64, function(err){
//     //     if(err) throw err;
//     //     console.log('file created');
//     // });

//     //console.log(req.body.img);
//     // write contents to disk in file
//     // watch directory

// });

// router.get('/test', function(req, res){
//     res.render('pages/test.html');
// });

// module.exports = router;