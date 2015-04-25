/*
 * Main request handler. Currently only exports a POST handler.
 */

var formidable = require('formidable');
var request = require('request');
var rp = require('request-promise');
var pg = require('pg');
var formatter = require('../formatters/defaultFormatter.js');

var postMessageToSlack = function(body, callback) {
  rp({url: 'https://slack.com/api/chat.postMessage', method: 'POST', form: body})
    .then(function(body) {
      var result = JSON.parse(body);
      if (result.ok) {
        callback(null);
      } else {
        callback(result.error);
      }
    })
    .catch(function(err) {
      callback(err);
    });
};

var checkIfUserRegistered = function(userId, callback) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      done();
      callback(err, null);
      return;
    }

    client.query("SELECT * FROM users WHERE id = $1", [userId], function(err, result) {
      done();
      client.end();

      if (err) {
        callback(err, null);
      } else {
        var userExists = result.rowCount > 0;
        if (userExists) {
          callback(null, result.rows[0]);
        } else {
          callback(null, null);
        }
      }
    });
  });
};

var handleExistingUser = function(req, res, user, fields) {
  var text = fields.text;
  var standupMessage = formatter.format(text);
  console.log('Formatted standup message: ', standupMessage);
  if (standupMessage) {
    console.log('Posting standup message to Slack...');
    var body = {
      "token": user.token,
      "channel": fields.channel_id,
      "text": standupMessage,
      "as_user": true
    };
    postMessageToSlack({"token": user.token,"channel": fields.channel_id,"text": standupMessage,"as_user": true}, function(err) {
      if (err) {
        res.send('Could not post message because of ' + err);
      } else {
        res.end();
      }
    });
  } else {
    // Send a DM to the user with the bad standup message.
    var body = {
      token: user.token,
      user: user.id
    };
    rp({url: 'https://slack.com/api/im.open', method: 'POST', form: body})
      .then(function(body) {
        var result = JSON.parse(body);
        if (result.ok) {
          var message = 'Whoops! Your standup message seems to be invalid. You posted `' + text + '`.';
          postMessageToSlack({"token": user.token, "channel": result.channel.id, "text": message, "username": "Standup Formatter", "icon_emoji": ":shit:"}, function(err) {
            if (err) {
              console.log(err);
            }
            res.end();
          });
        }
      })
      .catch(function(err) {
        console.log(err);
      });
  }
};

var handleNewUser = function(req, res) {
  var url = 'https://slack.com/oauth/authorize?scope=read,post,client&client_id=' + process.env.CLIENT_ID;
  res.send('Authorize this app by visiting: ' + url);
};

exports.post = function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields) {
    if (err) {
      console.log('failed to parse request');
      res.statu(400).send('What a bad request *tsk* *tsk*...');
      return;
    }

    console.log('parsed request', fields);

    // Check if user is already registered
    checkIfUserRegistered(fields.user_id, function(err, user) {
      if (err) {
        console.log('Error checking if user is registered', err);
        res.status(500).end();
        return;
      }

      if (user) {
        handleExistingUser(req, res, user, fields);
      } else {
        handleNewUser(req, res);
      }
    });
  });
};
