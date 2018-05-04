var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');
var config = require('./config');
var constants = require('./constants')
var passport = require('passport');
var multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();

module.exports = function () {
    var app = express();

    app.use(multipartyMiddleware);
    
    app.use(morgan('dev'));

    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 24*60*60*1000 }        
    }));

    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    require('../config/strategies/local')(passport);

    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(validator());

    app.set('views', ['./app/views', './public']);
    app.set('view engine', 'pug');

    require('../app/routes/index.server.routes')(app);
    require('../app/routes/user.server.routes')(app);
    require('../app/routes/sosrequest.server.routes')(app);
    require('../app/routes/tasklist.server.routes')(app);
    require('../app/routes/developers.server.routes')(app);

    app.use(express.static('./public'));

    /* catch 404 and forward to error handler */
    app.use(function (req, res, next) {
        var err = new Error(constants.PAGE_NOT_FOUND);
        err.status = 404;
        res.render('error', {
            title: err.status,
            message: err.message
        });
    });

    return app;
};