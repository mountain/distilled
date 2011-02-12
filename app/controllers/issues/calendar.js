module.exports = function (env) {
    var calendar = env.templates.issues.calendar;
    var ga = env.analytics.id;
    return function (req, res, next) {
        var year = req.params.year,
            month = req.params.month;

        var cur = new Date(year, month - 1).getTime(),
            prevmonth = new Date(cur - 15 * 24 * 3600 * 1000),
            nextmonth = new Date(cur + 45 * 24 * 3600 * 1000);

        prevmonth = '/issues/calendar/' + prevmonth.getUTCFullYear() + '/' +
                    (prevmonth.getUTCMonth() + 1);

        nextmonth = '/issues/calendar/' + nextmonth.getUTCFullYear() + '/' +
                    (nextmonth.getUTCMonth() + 1);

        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(calendar({year: year, month: month, prevmonth: prevmonth, nextmonth: nextmonth, ga: ga}));
    };
};
