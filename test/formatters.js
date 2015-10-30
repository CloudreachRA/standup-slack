var chai = require('chai');
var sinon = require('sinon');
var chaiAsPromised = require("chai-as-promised");

chai.should();
chai.use(chaiAsPromised);

describe('Formatter', function() {
  describe('default formatter', function() {

    var defaultFormatter = require('../formatters/defaultFormatter.js');
    it('should format valid standup message', function() {
      var input = '{"Yesterday": "N/A", "Today": "N/A"}';
      var expected = '_*Standup*_\n> *Yesterday*: N/A\n> *Today*: N/A';
      return defaultFormatter.format(input).should.eventually.equal(expected);
    });

    it('should format non-standard standup message', function() {
      var input = "{Yesterday: 'N/A', Today: 'N/A'}";
      var expected = '_*Standup*_\n> *Yesterday*: N/A\n> *Today*: N/A';
      return defaultFormatter.format(input).should.eventually.equal(expected);
    });

    it('should format non-standard standup message without curly brackets', function() {
      var input = "Yesterday: 'N/A', Today: 'N/A'";
      var expected = '_*Standup*_\n> *Yesterday*: N/A\n> *Today*: N/A';
      return defaultFormatter.format(input).should.eventually.equal(expected);
    });

    it('should format non-standard standup message without quotes', function() {
      var input = "{Yesterday: Did some stuff., Today: More stuff.}";
      var expected = '_*Standup*_\n> *Yesterday*: Did some stuff.\n> *Today*: More stuff.';
      return defaultFormatter.format(input).should.eventually.equal(expected);
    });

    it('should format standup message with unicode double quote characters', function() {
      var input = "{“Yesterday”: “Did some stuff.”, “Today”: “More stuff.”}";
      var expected = '_*Standup*_\n> *Yesterday*: Did some stuff.\n> *Today*: More stuff.';
      return defaultFormatter.format(input).should.eventually.equal(expected);
    });

    it('should reject standup message with bad input', function() {
      var input = "Yesterday: This is, bad";
      return defaultFormatter.format(input).should.be.rejected;
    });

  });

  describe('holiday formatter', function() {

    var holidayFormatter = require('../formatters/holiday.js');
    it('should decorate valid standup message on Christmas day', function() {
      // Fake current time
      var clock = sinon.useFakeTimers(new Date(2015, 11, 25).getTime());

      var input = '{"Yesterday": "N/A", "Today": "N/A"}';
      var expected = ':christmas_tree:_*Standup*_:christmas_tree:\n> *Yesterday*: N/A\n> *Today*: N/A';

      return holidayFormatter.format(input).should.eventually.equal(expected);

      // Restore time
      clock.restore();
    });

    it('should decorate valid standup message on Halloween day', function() {
      // Fake current time
      var clock = sinon.useFakeTimers(new Date(2015, 9, 31).getTime());

      var input = '{"Yesterday": "N/A", "Today": "N/A"}';
      var expected = ':ghost:_*Standup*_:ghost:\n> *Yesterday*: N/A\n> *Today*: N/A';

      return holidayFormatter.format(input).should.eventually.equal(expected);

      // Restore time
      clock.restore();
    });

    it('should decorate valid standup message day before Halloween', function() {
      // Fake current time
      var clock = sinon.useFakeTimers(new Date(2015, 9, 30).getTime());

      var input = '{"Yesterday": "N/A", "Today": "N/A"}';
      var expected = ':ghost:_*Standup*_:ghost:\n> *Yesterday*: N/A\n> *Today*: N/A';

      return holidayFormatter.format(input).should.eventually.equal(expected);

      // Restore time
      clock.restore();
    });

    it('should decorate valid standup message on Labor day', function() {
      // Fake current time
      var clock = sinon.useFakeTimers(new Date(2015, 8, 7).getTime());

      var input = '{"Yesterday": "N/A", "Today": "N/A"}';
      var expected = ':us:_*Standup*_:us:\n> *Yesterday*: N/A\n> *Today*: N/A';

      return holidayFormatter.format(input).should.eventually.equal(expected);

      // Restore time
      clock.restore();
    });

  });
});
