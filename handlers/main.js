/*
 * Main request handler. Currently only exports a POST handler.
 */

var formidable = require('formidable');
var rp = require('request-promise');
var formatter = require('../formatters/defaultFormatter.js');

var User = require('../models/user');

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
  User.where({ id: userId })
    .fetch()
    .then(function(model) {
      callback(null, model);
    })
    .catch(function (err) {
      callback(err, null);
    });
};

var handleExistingUser = function(req, res, user, fields) {
  var text = fields.text;
  formatter.format(text)
    .then(function(standupMessage) {
      console.log('Formatted standup message: ', standupMessage);
      console.log('Posting standup message to Slack...');
      postMessageToSlack({
        "token": user.token,
        "channel": fields.channel_id,
        "text": standupMessage,
        "as_user": true,
        "parse": "full"
      }, function(err) {
        if (err) {
          res.send('Could not post message because of ' + err);
        } else {
          res.end();
        }
      });
    })
    .catch(function (err) {
      // Send a DM to the user with the bad standup message.
      var body = {
        token: user.token,
        user: user.id
      };
      rp({url: 'https://slack.com/api/im.open', method: 'POST', form: body})
        .then(function(body) {
          var result = JSON.parse(body);
          if (result.ok) {
            var message = 'Whoops! Your standup message seems to be invalid. You posted\n>' + text + '\n With the following error\n> ' + err;
            postMessageToSlack({"token": user.token, "channel": result.channel.id, "text": message, "username": "Standup Formatter", "icon_emoji": ":shit:"}, function(err) {
              if (err) {
                console.log(err);
              }
              res.end();
            });
          } else {
            console.log('Unable to post message: ', result);
            res.end();
          }
        })
        .catch(function(err) {
          console.log(err);
          res.end();
        });
    });
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
      res.status(400).send('What a bad request *tsk* *tsk*...');
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
        handleExistingUser(req, res, user.attributes, fields);
      } else {
        handleNewUser(req, res);
      }
    });
  });
};
