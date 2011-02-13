var _ = require('underscore');

var path = require('path'),
    fs   = require('fs'),
    sys  = require('sys');

var logger = require('../../lib/log').logger;

function out(date) {
    var yr = date.getUTCFullYear(),
        mon = date.getUTCMonth(),
        day = date.getUTCDate();
    return yr + '/' + (mon + 1) + '/' + day;
}

function read(day) {
    var file = process.cwd() + '/public/issues/' + day + '.json', obj;
    try {
        obj = JSON.parse(fs.readFileSync(file).toString('utf8'));
    } catch (e) {
        sys.puts(e);
    }
    var cover = '', bg = '', photo = '';
    if (obj && obj.cover) {
        cover = obj.cover;
    }
    if (obj && obj.bg) {
        bg = obj.bg;
    }
    if (obj && obj.photo) {
        photo = obj.photo;
    }
    return {
        cover: cover,
        bg: bg,
        photo: photo,
        day: day
    };
}

function find() {
    var n = 0, k = 0,
        time = new Date().getTime(),
        cur  = new Date(time),
        latest = [];

    while (n < 7 && k < 30) {
        var day = out(cur),
            o = read(day);
        logger.info('seeking at: ' + day);
        if (o.cover !== '') {
            n++;
            latest.push(o);
        }
        k++;
        time = time - 24 * 3600 * 1000;
        cur  = new Date(time);
    }

    return latest;
}

var tmpl = _.template('<li class="mag" title="<%= day %>" bg="<%= bg %>" cover="<%= cover %>" photo="<%= photo %>"/>');

function list(latest) {
    var items = '',
        ind = 0;
    for (;ind < latest.length;ind++) {
        var elem = latest[ind];
        items += tmpl(elem);
    }
    return '<ul>' + items + '</ul>';
}

exports.gen = function () {
    var file = process.cwd() + '/public/issues/latest.html';
    logger.info('saving latest to:' + file);
    try {
        var content = list(find());
        fs.writeFileSync(file, content);
    } catch (e) {
        sys.puts(e);
        sys.puts(e.message);
    }
};

