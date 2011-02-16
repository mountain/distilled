module.exports = function (env) {
    var participation = env.templates.participation;
    var ga = env.analytics.id;
    return function (req, res, next) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(participation({ga: ga}));
    };
};
