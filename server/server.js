

// ==========================================================
// DEFINE APP AND DEPENDENCIES
// ==========================================================

var express     = require('express');
var path        = require('path');
var logger      = require('morgan');
var bodyParser  = require('body-parser');

var app         = express();



// ==========================================================
// CONFIG AND DEFINE MIDDLEWARE
// ==========================================================

// define middleware
app.use(logger('dev'));
app.use(bodyParser.json());

app.all('/*', function(req, res, next) {

    // CORS (cross-origin resource sharing) headers
    res.header("Access-Control-Allow-Origin", "*");     // restrict it to the required domain
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");

    // set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept');

    // If someone calls with method OPTIONS, display the allowed methods on our API
    // the OPTIONS call allows the user to see what options are available for the given API
    if (req.method == 'OPTIONS') {
        res.status(200);
        res.write("Allow: GET, PUT, POST, DELETE, OPTIONS");
        res.end();
    } else {
        next();
    }
});

// set the static files location
// bc server.js is in server folder and index.html is client, need to use the '/../' syntax
app.use(express.static(__dirname + '/../client'));



// ==========================================================
// START APP ON SERVER
// ==========================================================

app.use('/', require('./routes'));

// if route is not matched to any defined in our 'routes' file, return a 404
app.use(function (req, res, next) {
    var err = new Error('Not found');
    err.status = 404;
    console.log(err);
    next(err);
});

// start server
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});