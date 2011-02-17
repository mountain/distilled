module.exports = function (env) {
    var issue = env.templates.issues.issue;
    var ga = env.analytics.id;
    return function (req, res, next) {
        var year = req.params.year;
        var month = req.params.month;
        var day = req.params.day;
		
		if (isNaN(day) || parseInt(day) < 0 || parseInt(day) > 31){
            res.writeHead(404, {
                'Content-Type': 'text/html'
            });
            res.end('');
            return false;
        }
		
        try {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end(issue({year: year, month: month, day: day, ga: ga}));
        } catch (e) {
            require('sys').puts(e);
            require('sys').puts(e.stack);
        }
    };
};
