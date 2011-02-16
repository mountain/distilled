module.exports = function (env) {
    var team = env.templates.team;
    var ga = env.analytics.id;
    return function (req, res, next) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(team({ga: ga}));
    };
};
