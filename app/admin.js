exports.app = function (env) {
    var admin = env.templates.admin;
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
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(editor({year: year, month: month, day: day}));
            } catch (e) {
                require('sys').puts(e);
                require('sys').puts(e.stack);
            }
        }
    };
};


