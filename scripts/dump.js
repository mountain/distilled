var sys = require('sys');

var optparse = require('../vendors/optparser/lib/optparse');

var SWITCHES = [
    ['-c', '--cover TEXT', "full|center|north|east"],
    ['-p', '--photo TEXT', "feature|featurepic|good|itn|otd|dyk|File:XXXX.ext"],
    ['-t', '--toc TEXT', "an arrangement for itn, dyk,otd, feature, good, featurepic"],
    ['-h', '--help', "Shows this help section"],
    ['-b', '--background TEXT', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-u', '--ubackground [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-v', '--vbackground [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-w', '--wbackground [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-x', '--xbackground [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-y', '--ybackground [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"],
    ['-z', '--zbackground [TEXT]', "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow"]
];

var parser = new optparse.OptionParser(SWITCHES), to_dump = true;
parser.banner = 'Usage: dump.js [opt]';

var opt = {
    cover: 'center',
    photo: 'feature',
    toc: ['itn', 'dyk', 'otd', 'feature', 'good', 'featurepic'],
    background: 'white',
    ubackground: undefined,
    vbackground: undefined,
    wbackground: undefined,
    xbackground: undefined,
    ybackground: undefined,
    zbackground: undefined
};

parser.on('cover', function (name, arg) {
    sys.puts(sys.inspect(arguments));
    opt.cover = arg;
});
parser.on('photo', function (name, arg) {
    opt.photo = arg;
});
parser.on('toc', function (name, arg) {
    opt.toc = arg.split('|');
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


