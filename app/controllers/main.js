var sys = require('sys');

exports.app = function (env) {
    var main = env.templates.main;
    var ga = env.analytics.id;
    return function (req, res, next) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(main({ga: ga}));
    };
};

