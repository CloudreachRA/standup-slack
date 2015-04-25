/*
 * Auth request handler. Currently only exports a GET handler.
 * This handler will be triggered by the Slack OAuth flow when
 * it is ready to obtain an access token.
 */

var rp = require('request-promise');
var pg = require('pg');

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
            pg.connect(process.env.DATABASE_URL, function(err, client, done) {
              if (err) {
                console.log('postgres connection error', err);
                res.status(500).send('There was an error with your request :(');
                client.end();
                done();
                return;
              }

              client.query("INSERT INTO users (id, token) VALUES ($1, $2)", [userId, accessToken], function(err, result) {
                done();
                client.end();

                if (err) {
                  console.error('error inserting data', err);
                  res.status('500').end();
                } else {
                  res.send('OK');
                }
              });
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
