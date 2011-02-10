var _ = require('../../lib/underscore');

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
        photo: photo
    };
}

function find() {
    var date = new Date();

}

function list(latest) {
}

exports.gen = function () {
    var file = process.cwd() + '/public/issues/latest.html';
    sys.puts('saving latest to:' + file);
    var content = list(find());
    fs.writeFileSync(file, content);
};

