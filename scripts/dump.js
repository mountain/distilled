var sys = require('sys');

var optparse = require('../vendors/optparser/lib/optparse');

var SWITCHES = [
    ['-c', '--cover', "center|north|east"],
    ['-p', '--photo', "feature|featurepic|good|itn|otd|dyk|File:XXXX.ext"],
    ['-t', '--toc', "an arrangement for itn, dyk,otd, feature, good, featurepic"],
    ['-h', '--help', "Shows this help section"]
];

var parser = new optparse.OptionParser(SWITCHES), to_dump = true;
parser.banner = 'Usage: dump.js [opt]';

// Internal variable to store opt.
var opt = {
    cover: 'center',
    photo: 'feature',
    toc: ['itn', 'dyk', 'otd', 'feature', 'good', 'featurepic']
};

parser.on('cover', function (value) {
    opt.cover = value;
});
parser.on('photo', function (value) {
    opt.photo = value;
});
parser.on('toc', function (value) {
    opt.toc = value.split('|');
});
parser.on('help', function () {
    sys.puts(parser.toString());
    to_dump = false;
});

parser.parse(process.ARGV);

if (to_dump) {
    sys.puts("Cover: " + opt.cover);
    sys.puts("Photo: " + opt.photo);
    sys.puts("TOC: " + opt.toc);

    var config = {
        lang: 'zh',
        variant: 'zh-cn',
        wiki: 'wiki',
        mainpage: 'Wikipedia:首页'
    };

    var dumper = require('../vendors/distilled/dumper').create(config);
    dumper.dump(opt);
}


