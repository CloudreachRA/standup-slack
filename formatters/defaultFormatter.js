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
  try {
    var parsedText = jsonic(text);
    var standupMessage = buildTemplate(parsedText);
    return S(standupMessage).template(parsedText).s;
  } catch (err) {
    console.log('Error formatting standup message: ', err);
    return null;
  }
};
