module.exports = function (env) {
    var calendar = env.templates.issues.calendar;
    var ga = env.analytics.id;
    return function (req, res, next) {
        var year = req.params.year;
        var month = req.params.month;
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(calendar({year: year, month: month, ga: ga}));
    };
};
