module.exports = function (env) {
    var issue = env.templates.issues.issue;
    var ga = env.analytics.id;

    return function (req, res, next) {
        // prepare params
        var year  = req.params.year
          , month = req.params.month
          , day   = req.params.day;

        // process
        try {
            var path = require("path")
              , dataPath = path.join(
                  env.path, "public/issues", year, month, day
                ) + ".json";

            path.exists(dataPath, function (exists) {
                if (exists) {
                    var html = issue({year: year, month: month, day: day, ga: ga});
                    respond(res, 200, html, 'text/html');
                } else {
                    respond(res, 404, 'Page Not Found', 'text/plain');
                }
            });
        } catch (e) {
            //TODO log to error.log
            require('sys').puts(e);
            require('sys').puts(e.stack);
        }
    };
};

function respond (res, statusCode, body, contentType) {
    res.writeHead(statusCode, { 'Content-Type': contentType });
    res.end(body);
}
