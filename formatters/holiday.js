/*
 * Holiday themed standup formatter.
 * If the current date is a holiday, we should add some decorations.
 */

var S = require('string');
var jsonic = require('jsonic');
var Promise = require('bluebird');
var holidays = {
  "12/25": ":christmas_tree:",
  "10/31": ":ghost:"
};

var getDecoration = function(date) {
  // Plus 1 to month since month starts at 0.
  var key = (date.getMonth() + 1) + '/' + date.getDate();
  return holidays[key];
};

var decorate = function(text) {
  var emoji = getDecoration(new Date());
  if (emoji) {
    return emoji + text + emoji;
  }

  return text;
};

var buildTemplate = function(json) {
  var template = decorate('_*Standup*_') + '\n';
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

      var parsedText =  jsonic(text);
      var standupMessage = buildTemplate(parsedText);
      var formattedMessage = S(standupMessage).template(parsedText).s;

      resolve(formattedMessage);
    } catch (err) {
      console.log('Error formatting standup message: ', err);
      reject(err);
    }
  });
};
