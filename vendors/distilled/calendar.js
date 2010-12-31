var _ = require('../../lib/underscore');

var path = require('path'),
    fs   = require('fs'),
    sys  = require('sys');

var logger = require('../../lib/log').logger;

var header = ['一', '二', '三', '四', '五', '六', '日'];

function out(date) {
    var yr = date.getUTCYear(),
        mon = date.getUTCMonth(),
        day = date.getUTCDate();
    return yr + '/' + (mon + 1) + '/' + day;
}

function calendar(timestamp) {
    var date = new Date(timestamp), cal = [],
    cur = date.getUTCDate(),
    time1st = timestamp - 24 * 3600 * 1000 * date.getUTCDate(),
    first =  new Date(time1st),
    day1st = first.getUTCDay(),
    mon = first.getUTCMonth(),
    yr = first.getUTCYear(),
    pos = day1st + cur,
    row = Math.floor(pos / 7),
    col = pos - 7 * row;

    for (var i = (day1st - 1); i > 0; i--) {
        var last = new Date(time1st - i * 24 * 3600 * 1000);
        cal.push(out(last));
    }

    for (var j = 0;
        mon === Date(time1st + j * 24 * 3600 * 1000).getUTCMonth(); j++) {
        cal.push(yr + '/' + (mon + 1) + '/' + (j + 1));
    }

    for (var k = j - 1; k < 7 * Math.ceil((j - 1) / 7); k++) {
        var next = new Date(time1st + (k + 1) * 24 * 3600 * 1000);
        cal.push(out(next));
    }

    return {
        header: header,
        cal: cal,
        cur: out(date),
        pos: {row: row, col: col}
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
    var tbl = '<table>';
    tbl += '<thead><tr>' + _.map(cal.header, function (day) {
        return '<td>' + day + '</td>';
    }).join() + '</tr></thead>';
    tbl += '<tbody>';
    _.each(cal.cal, function (day, ind) {
        if (ind % 7 === 0) {
            tbl += '<tr>';
        }

        tbl += ('<td class="cal-cell" ' +
                     'title="' + day + '" ' +
                     'cover="' + cover(day) + '" ' +
                     'photo="' + photo(day) + '"></td>');

        if (ind % 7 === 0) {
            tbl += '</tr>';
        }
    });
    tbl += '</tbody>';
    tbl += '</table>';
    return tbl;
}

exports.gen = function (date) {
    date = date || new Date();
    var year = date.getUTCFullYear(),
        month = date.getUTCMonth() + 1;
    var file = process.cwd() + '/public/issues/' + year + '/' + month + '/index.html';
    sys.puts('saving calendar to:' + file);
    var content = table(calendar(date.getTime()));
    fs.writeFileSync(file, content);
};

