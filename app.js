"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require('./errorHandler');
var index = require('./routes/index');
var listController = require('./controllers/lists');

const fileUpload = require('express-fileupload');

// default options
var app = express();
var mongo = require('mongodb').MongoClient;
var db;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());


app.use(function(req, res, next){
 req.db = db;
 next();
});

app.use('/', index);
app.get('/:username/:listId', listController.getList);
app.get('/:username', listController.getAll);
app.post('/:username/create', listController.createList);
app.post('/:username/:listId/update', listController.update);
app.post('/:username/:listId/erase', listController.eraseList);
app.post('/:username/:listId/upload', listController.uploadReceipt);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


var url = 'mongodb://localhost:27017/shop';

mongo.connect(url, (err, _db) => {
  if(err) return errorHandler(err);
  console.log("Connected successfully to db");
  db = _db;
  app.listen(8000, () => {
    console.log('listening on 8000');
  });
});