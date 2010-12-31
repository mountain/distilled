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

    for (var k = j - 1; k < 7 * Math.ceil((j - 1) / 7); k++) {
        var next = new Date(time1st + k * 24 * 3600 * 1000);
        cal.push(out(next));
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
        return '<td>' + day + '</td>';
    }).join('') + '</tr></thead>\n';
    tbl += '<tbody>\n';
    _.each(cal.cal, function (day, ind) {
        if (ind % 7 === 0) {
            tbl += '<tr>';
        }

        tbl += ('<td class="cal-cell" ' +
                     'title="' + day + '" ' +
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

