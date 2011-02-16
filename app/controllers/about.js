module.exports = function (env) {
    var about = env.templates.about;
    var ga = env.analytics.id;
    return function (req, res, next) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(about({ga: ga}));
    };
};
