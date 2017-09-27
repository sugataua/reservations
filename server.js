/*jshint esversion: 6 */

var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

const PORT = 8081;
//const connURL = "mongodb://localhost:27017/mydb";

const config = require('config');

var app = express();

 
//*** For debuging using POSTMAN and x-www-form-urlencoded ***
//app.use(bodyParser.urlencoded({ extended: true}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



MongoClient.connect(config.DBHost, function(err, db){
    if (err) throw console.log(err);
    console.log(config.DBHost);
    
    app.get('/', (req, res) => {
        res.sendfile('./public/index.html');
    });
    
    require('./routes') (app, db);        
    
    app.use(express.static('public'));

    app.all('*', function(req, res) {
        res.sendfile('./public/index.html');
      });



    
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.status(500).send('An error has occured');
      });


    app.listen(PORT, function () {
        console.log("App is listening on port " + PORT);
    });

    //db.close();
    
});


module.exports = app;