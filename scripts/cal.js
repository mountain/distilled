var sys = require('sys');

var optparse = require('../vendors/optparser/lib/optparse');

var SWITCHES = [
    ['-d', '--date [DATE]', "target date"],
    ['-h', '--help', "Shows this help section"]
];

var parser = new optparse.OptionParser(SWITCHES), to_cal = true;
parser.banner = 'Usage: cal.js [opt]';

var opt = {
    date: Date.now()
};

parser.on('date', function (name, arg) {
    opt.date = arg;
});
parser.on('help', function () {
    sys.puts(parser.toString());
    to_cal = false;
});

parser.parse(process.ARGV);

if (to_cal) {
    sys.puts("date: " + opt.date);

    require('../vendors/distilled/calendar').gen(opt.date);
}


