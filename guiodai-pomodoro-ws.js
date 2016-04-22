'use strict';
(function(){


  var express = require('express');
  var mongoose = require('mongoose');
  var bodyParser = require('body-parser');
  var https = require('https');
  var fs = require('fs');

  mongoose.connect('mongodb://localhost');

  var db = mongoose.connection;
  var pomodoroIssue = {};

  db.on('error', console.error);
  db.once('open', function(){

     pomodoroIssue = new mongoose.Schema({
        userId : Number,
        issueId : Number,
        pomodoros : Number
      }, { collection : 'guiodaiPomodoro' });

  });



  var app = express();




  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


  var router = express.Router();

  router.get('/pomodoro/userid/:userId/issueid/:issueId', function(req, res) {

    var Issue = mongoose.model('Issue', pomodoroIssue);
    Issue.findOne({'userId' : req.params.userId, 'issueId' : req.params.issueId}, function(err, Issue){

      if(err){
        res.status(400);
        res.send({statusCode : 400, message : err});
      }else if(!Issue){
        res.status(404);
        res.send({statusCode : 404, message : 'Issue not found'});
      }else{
        res.status(200).send(Issue);
      }

    });
  });


  router.post('/pomodoro', function(req, res) {

    var Issue = mongoose.model('Issue', pomodoroIssue);
    Issue.findOneAndUpdate({'userId' : req.body.userId, 'issueId' : req.body.issueId}, {$inc : {pomodoros : 1}}, {upsert : true}, function(err, Issue){

      if(err){
        res.status(400);
        res.send({statusCode : 400, message : err});
      }else{
        res.status(200).send({statusCode : 200, message : 'Pomodoro inserted!'});
      }

    });
  });



  https.createServer({
    key : fs.readFileSync('key.pem'),
    cert : fs.readFileSync('cert.pem')
  }, app).listen(8080);



  app.use('/pomodoro/services', router);
  //app.listen(8080);


})();
