var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
var session = require('express-session');

app.use(bodyParser.json());

const PORT = 3000;
const IP = "localhost";

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'testdb'
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/src/public/index.html'));
});

app.get('/bundle.js', function (req, res) {
  res.sendFile(path.join(__dirname + '/src/build/bundle.js'));
});

app.post('/login', function (req, res) {
  console.log(JSON.stringify(req.body));
  console.log("requset recieved");
  var body = req.body
  connection.query('select * from users where username = ? and password = ?',
    [body.username, body.password], (error, results, fields) => {
      if (error) throw error;
      if (results.length > 0) {
        res.send("success");
      } else {
        res.send("result is empty");
      }
    });
});

app.post('/addstudent', function (req, res) {
  console.log(JSON.stringify(req.body));
  console.log("requset recieved");
  var body = req.body;

  connection.query('SELECT * FROM student WHERE admission_no = ?', [body.admissionNumber], (error, results, fields) => {
    if (results.length < 1) {
      connection.query('INSERT INTO student' +
        ' (admission_no, registration_no, gender, name,' +
        'dob, mother_name, father_name, guardian_name,' +
        ' resident_address, contact_no) VALUES (?,?,?,?,?,?,?,?,?,?) ',
        [body.admissionNumber, body.registrationNumber, body.gender, body.name,
         body.dob, body.motherName, body.fatherName, '', 
         body.address, body.contactNo], (error, results, fields) => {
          if (error) console.log(error);
          if (parseInt(results.affectedRows) > 0) {
            connection.query('INSERT INTO class' +
              ' (admission_no, year, class, section) VALUES (?,?,?,?) ',
              [body.admissionNumber, body.year, body.classOfStudent, body.section], (error, results, fields) => {
                if (error) console.log(error);
                if (parseInt(results.affectedRows) > 0) {
                  res.send("success");
                } else {
                  res.send("result is empty");
                }
              });
          } else {
            res.send("result is empty");
          }
        });
    } else {
      res.send("student already exists");
    }
  });
});


app.listen(PORT, IP);

console.log("Running at http://" + IP + ":" + PORT);
