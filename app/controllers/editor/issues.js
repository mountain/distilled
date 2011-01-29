var path = require('path'),
    fs   = require('fs'),
    sys  = require('sys');

exports.app = function (env) {
    var editor = env.templates.editor.issues;
    return {
        get: function (req, res, next) {
            var year = req.params.year;
            var month = req.params.month;
            var day = req.params.day;
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(editor({year: year, month: month, day: day}));
            } catch (e) {
                require('sys').puts(e);
                require('sys').puts(e.stack);
            }
        },
        put: function (req, res, next) {
            var year = req.params.year;
            var month = req.params.month;
            var day = req.params.day;
            var html = req.body.html;
            try {
                var file = env.path + 'public/issues/' + year + '/' + month + '/' + day + '.html';
                if (html) {
                    fs.writeFile(file, html, function (err) {
                        if (err) {
                            res.writeHead(500, {});
                            res.end();
                        } else {
                            res.writeHead(204, {});
                            res.end();
                        }
                    });
                } else {
                    res.writeHead(400, {});
                    res.end();
                }
            } catch (e) {
                require('sys').puts(e);
            }
        }
    };
};


