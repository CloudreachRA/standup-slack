/*
 * Auth request handler. Currently only exports a GET handler.
 * This handler will be triggered by the Slack OAuth flow when
 * it is ready to obtain an access token.
 */

var rp = require('request-promise');

var User = require('../models/user');

exports.get = function(req, res) {
  var code = req.query.code;
  var body = {
    "client_id": process.env.CLIENT_ID,
    "client_secret": process.env.CLIENT_SECRET,
    "code": code,
    "redirect_uri": process.env.REDIRECT_URI
  };

  rp({url: 'https://slack.com/api/oauth.access', method: 'POST', form: body})
    .then(function(body) {
      var result = JSON.parse(body);
      var accessToken = result.access_token;
      if (result.ok) {
        rp({url: 'https://slack.com/api/auth.test?token=' + accessToken})
          .then(function(body) {
            var userId = JSON.parse(body).user_id;

            new User({ id: userId, token: accessToken })
              .save(null, { method: 'insert' })
              .then(function () {
                res.send('OK');
              })
              .catch(function (err) {
                console.log('error inserting user: ', err);
                res.status('500').end();
              });
          })
          .catch(function(err) {
            console.log('failed to get auth info', err);
            res.status(500).end();
          });
      } else {
        res.status(401).send(result.error);
      }
    })
    .catch(function(err) {
      console.log('code exchange failed', err);
      res.status(400);
    });
};
