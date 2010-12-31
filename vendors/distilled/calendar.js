var _ = require('../../lib/underscore');

var path = require('path'),
    fs   = require('fs'),
    sys  = require('sys');

var logger = require('../../lib/log').logger;

var header = ['一', '二', '三', '四', '五', '六', '日'];

function out(date) {
    var yr = date.getUTCFullYear(),
        mon = date.getUTCMonth(),
        day = date.getUTCDate();
    return yr + '/' + (mon + 1) + '/' + day;
}

function calendar(timestamp) {
    var date = new Date(timestamp), cal = [],
    cur = date.getUTCDate(),
    time1st = timestamp - 24 * 3600 * 1000 * (date.getUTCDate() - 1),
    first =  new Date(time1st),
    day1st = first.getUTCDay(),
    mon = date.getUTCMonth();

    for (var i = (day1st - 1); i > 0; i--) {
        var last = new Date(time1st - i * 24 * 3600 * 1000);
        cal.push(out(last));
    }

    var p = first;
    for (var j = 1; mon === p.getUTCMonth(); j++) {
        cal.push(out(p));
        p = new Date(time1st + j * 24 * 3600 * 1000);
    }

    for (var k = j - 1; (k + day1st - 1) < 7 * Math.ceil((j + day1st - 2) / 7); k++) {
        var next = new Date(time1st + k * 24 * 3600 * 1000);
        cal.push(out(next));
    }

    if (cal.length === 28) {
        for (var l = k; (l + day1st - 1) < 7 * Math.ceil((k + day1st) / 7); l++) {
            var next2 = new Date(time1st + l * 24 * 3600 * 1000);
            cal.push(out(next2));
        }
    }

    if (cal.length === 35) {
        for (var m = k; (m + day1st - 1) < 7 * Math.ceil((k + day1st) / 7); m++) {
            var next3 = new Date(time1st + m * 24 * 3600 * 1000);
            cal.push(out(next3));
        }
    }

    return {
        header: header,
        cal: cal,
        cur: out(date)
    };
}

function read(day) {
    var file = process.cwd() + '/public/issues/' + day + '.json', obj;
    try {
        obj = JSON.parse(fs.readFileSync(file).toString('utf8'));
    } catch (e) {
        sys.puts(e);
    }
    return obj;
}

function bg(day) {
    var settings = read(day), value = "";
    if (settings) {
        value = settings.bg;
    }
    return value;
}

function cover(day) {
    var settings = read(day), value = "";
    if (settings) {
        value = settings.cover;
    }
    return value;
}

function photo(day) {
    var settings = read(day), value = "";
    if (settings) {
        value = settings.photo;
    }
    return value;
}

function table(cal) {
    var tbl = '<table>\n';
    tbl += '<thead><tr>' + _.map(cal.header, function (day) {
            return '<td style="width: 14%">' + day + '</td>';
    }).join('') + '</tr></thead>\n';
    tbl += '<tbody>\n';
    _.each(cal.cal, function (day, ind) {
        if (ind % 7 === 0) {
            tbl += '<tr>';
        }

        tbl += ('<td style="height: 16%" class="cal-cell" ' +
                     'title="' + day + '" ' +
                     'bg="' + bg(day) + '" ' +
                     'cover="' + cover(day) + '" ' +
                     'photo="' + photo(day) + '"></td>');

        if (ind % 7 === 6) {
            tbl += '</tr>\n';
        }
    });
    tbl += '</tbody>\n';
    tbl += '</table>';
    return tbl;
}

exports.gen = function (date) {
    date = new Date(date);
    var year = date.getUTCFullYear(),
        month = date.getUTCMonth() + 1,
        day = date.getUTCDate();

    var file = process.cwd() + '/public/issues/' + year + '/' + month + '/index.html';
    sys.puts('saving calendar to:' + file);
    var content = table(calendar(date.getTime()));
    fs.writeFileSync(file, content);

    file = process.cwd() + '/public/issues/current.json';
    sys.puts('saving cur to:' + file);
    content = '{ "date": "' + year + '/' + month + '/' + day + '"}';
    fs.writeFileSync(file, content);
};

