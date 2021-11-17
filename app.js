var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let db = require('./models');
let sequelize = db.sequelize;
var app = express();



try{
  db.sequelize.authenticate();
  console.log('Connection to the database successful!');
  db.sequelize.sync();
} catch (error) {
  console.error('Unable to connect to the database ', error);
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


/*404 handler to catch undefined or non-existent route request */
app.use((req,res,next) => {
  console.log('404 error handler called');
  res.status(404).render('page-not-found');
});

/*Global error handler */
app.use(function (error, req, res, next) {

  if (error) {
    console.log('Global error handler called', error);
  }
  if (error.status === 404) {
    res.status(404).render('page-not-found', {error});
  } else {
    error.message = error.message || `Oops! It looks like something went wrong on the server.`;
    res.status(error.status || 500).render('error', {error});
  }
});


module.exports = app;
