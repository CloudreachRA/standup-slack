var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;

describe('Formatter', function() {
  describe('default formatter', function() {

    var defaultFormatter = require('../formatters/defaultFormatter.js');
    it('should format valid standup message', function() {
      var input = '{"Yesterday": "N/A", "Today": "N/A"}';
      var expected = '_*Standup*_\n> *Yesterday*: N/A\n> *Today*: N/A';
      expect(defaultFormatter.format(input)).to.equal(expected);
    });

    it('should format non-standard standup message', function() {
      var input = "{Yesterday: 'N/A', Today: 'N/A'}";
      var expected = '_*Standup*_\n> *Yesterday*: N/A\n> *Today*: N/A';
      expect(defaultFormatter.format(input)).to.equal(expected);
    });

    it('should format non-standard standup message without curly brackets', function() {
      var input = "Yesterday: 'N/A', Today: 'N/A'";
      var expected = '_*Standup*_\n> *Yesterday*: N/A\n> *Today*: N/A';
      expect(defaultFormatter.format(input)).to.equal(expected);
    });

    it('should format non-standard standup message without quotes', function() {
      var input = "{Yesterday: Did some stuff., Today: More stuff.}";
      var expected = '_*Standup*_\n> *Yesterday*: Did some stuff.\n> *Today*: More stuff.';
      expect(defaultFormatter.format(input)).to.equal(expected);
    });

  });

  describe('holiday formatter', function() {

    var holidayFormatter = require('../formatters/holiday.js');
    it('should decorate valid standup message on Christmas day', function() {
      // Fake current time
      var clock = sinon.useFakeTimers(new Date(2015, 11, 25).getTime());

      var input = '{"Yesterday": "N/A", "Today": "N/A"}';
      var expected = ':christmas_tree:_*Standup*_:christmas_tree:\n> *Yesterday*: N/A\n> *Today*: N/A';
      expect(holidayFormatter.format(input)).to.equal(expected);

      // Restore time
      clock.restore();
    });

    it('should decorate valid standup message on Halloween day', function() {
      // Fake current time
      var clock = sinon.useFakeTimers(new Date(2015, 9, 31).getTime());

      var input = '{"Yesterday": "N/A", "Today": "N/A"}';
      var expected = ':ghost:_*Standup*_:ghost:\n> *Yesterday*: N/A\n> *Today*: N/A';
      expect(holidayFormatter.format(input)).to.equal(expected);

      // Restore time
      clock.restore();
    });

  });
});
