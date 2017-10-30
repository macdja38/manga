var Express = require('express');
var app = Express();
require('dotenv').config();
var download = require('./routes/download');
var search = require('./routes/search');
var bodyParser = require('body-parser');
var path = require('path');
var info = require('./routes/info');

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/', download);

app.get('/public/index.js', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.js'));
});

app.get('/public/main.css', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/main.css'));
});

app.get('/info', info);

app.get('/search', search);

app.listen(port);