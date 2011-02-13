var sys = require('sys'),
    optparse = require('optparse');

var SWITCHES = [
    ['-c', '--cover [TEXT]', "full|center|north|west"],
    ['-p', '--photo [TEXT]', "feature|featurepic|good|itn|otd|dyk|File:XXXX.ext"],
    ['-t', '--toc [TEXT]', "an arrangement for itn, dyk,otd, feature, good, featurepic"],
    ['-b', '--bg [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-u', '--ubg [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-v', '--vbg [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-w', '--wbg [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-x', '--xbg [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-y', '--ybg [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-z', '--zbg [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-h', '--help', "Shows this help section"]
];

var parser = new optparse.OptionParser(SWITCHES), to_dump = true;
parser.banner = 'Usage: dump.js [opt]';

var opt = {
    cover: 'center',
    photo: 'feature',
    toc: ['itn', 'dyk', 'otd', 'feature', 'good', 'featurepic'],
    bg: 'white',
    ubg: undefined,
    vbg: undefined,
    wbg: undefined,
    xbg: undefined,
    ybg: undefined,
    zbg: undefined
};

parser.on('cover', function (name, arg) {
    opt.cover = arg;
});
parser.on('photo', function (name, arg) {
    opt.photo = arg;
});
parser.on('toc', function (name, arg) {
    opt.toc = arg.split('|');
});
parser.on('bg', function (name, arg) {
    opt.bg = arg;
});
parser.on('ubg', function (name, arg) {
    opt.ubg = arg;
});
parser.on('vbg', function (name, arg) {
    opt.vbg = arg;
});
parser.on('wbg', function (name, arg) {
    opt.wbg = arg;
});
parser.on('xbg', function (name, arg) {
    opt.xbg = arg;
});
parser.on('ybg', function (name, arg) {
    opt.ybg = arg;
});
parser.on('zbg', function (name, arg) {
    opt.zbg = arg;
});
parser.on('help', function () {
    sys.puts(parser.toString());
    to_dump = false;
});

parser.parse(process.ARGV);

if (to_dump) {
    sys.puts("cover: " + opt.cover);
    sys.puts("photo: " + opt.photo);
    sys.puts("toc: " + opt.toc);
    sys.puts("bg: " + opt.bg);

    var config = {
        lang: 'zh',
        variant: 'zh-cn',
        wiki: 'wiki',
        mainpage: 'Wikipedia:首页'
    };

    var dumper = require('../vendors/distilled/dumper').create(config);
    dumper.dump(opt);
}
