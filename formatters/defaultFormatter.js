/*
 * Standard standup formatter.
 *
 * Example output:
 * _*Standup*_
 * > *Yesterday*: Did some refactoring
 * > *Today*: Nothing
 */

var S = require('string');
var jsonic = require('jsonic');
var Promise = require('bluebird');

var buildTemplate = function(json) {
  var template = '_*Standup*_\n';
  var keys = Object.keys(json);
  keys.forEach(function(key, index) {
    template += '> *' + key + '*: {{' + key + '}}';
    if (index < keys.length-1) {
      template += '\n';
    }
  });

  return template;
};

exports.format = function(text) {
  return new Promise(function (resolve, reject) {
    try {
      // Replace unicode double/single quotes with
      // utf8 double/single quotes.
      text = text
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");

      var parsedText = jsonic(text);
      var standupMessage = buildTemplate(parsedText);
      var formattedMessage = S(standupMessage).template(parsedText).s;

      resolve(formattedMessage);
    } catch (err) {
      console.log('Error formatting standup message: ', err);
      reject(err);
    }
  });
};
