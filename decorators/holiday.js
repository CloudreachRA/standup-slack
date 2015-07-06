var moment = require('moment');

var holidays = {
  9: function(date) {
    // Labor day; seek to first Monday of the month
    var laborDay = moment().month(8).startOf('month');
    while (laborDay.day() != 1) {
      laborDay = laborDay.add(1, 'day');
    }
    if (date.date() == laborDay.date()) {
      return ":us:";
    }

    return null;
  },
  12: function(date) {
    switch (date.date()) {
      case 25:
        return ":christmas_tree:";
    }

    return null;
  },
  10: function(date) {
    switch (date.date()) {
      case 31:
        return ":ghost:";
    }

    return null;
  }
};

module.exports.query = function (date) {
  var dateAsMoment = moment(date);
  var monthOfYear = dateAsMoment.month() + 1;
  if (holidays[monthOfYear]) {
    return holidays[monthOfYear](dateAsMoment);
  } else {
    return null;
  }
};
