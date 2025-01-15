var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./public/routes/index');
var holidaysRouter = require('./public/routes/holidays');
var holidayDetailsRouter = require('./public/routes/holidayMain');
var holidayByDateRouter = require('./public/routes/holidaysByDate');
var holidaysByCategoryRouter = require('./public/routes/holidaysByCategory');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/holidays', holidaysRouter);
app.use('/holiday-details', holidayDetailsRouter);
app.use('/holidays-by-date', holidayByDateRouter);
app.use('/holidays-by-category', holidaysByCategoryRouter);

module.exports = app;
