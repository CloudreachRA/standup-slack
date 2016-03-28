// App dependencies
var express = require('express');
var mainHandler = require('./handlers/main.js');
var authHandler = require('./handlers/auth.js');
var pingHandler = require('./handlers/ping.js');

// Setup
var app = express();
app.set('port', (process.env.PORT || 5000));

app.post('/', mainHandler.post);
app.get('/auth', authHandler.get);
app.get('/ping', pingHandler.get);

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
