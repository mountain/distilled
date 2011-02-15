/*
 * Middlewares
 */

/*
 * Web Logger Middleware
 */
function weblogger(options) {
    // prepare default options
    var fmt = process.connectEnv.logFormat
            || options.format
            || ":remote-addr \":method\" :url :http-version :status \":referer\" \":user-agent\"",
        logfile = options.logfile || "app.log";

    // setup winston logger
    var winston = require("winston"),
        logger  = new (winston.Logger)({
          transports: [
            new (winston.transports.Console)(),
            new (winston.transports.File)({ filename: logfile })
          ]
        });

    return function webLogger(req, res, next) {
        var start = +new Date,
            statusCode,
            resHeaders,
            writeHead = res.writeHead,
            end = res.end,
            url = req.url;

        // Proxy for statusCode.
        res.writeHead = function(code, headers){
            res.writeHead = writeHead;
            res.writeHead(code, headers);
            res.statusCode = statusCode = code;
            res._headers = resHeaders = headers || {};
        };

        res.end = function(chunk, encoding) {
            res.end = end;
            res.end(chunk, encoding);
            res.responseTime = +new Date - start;
            logger.info(format(fmt, req, res));
        };

        // Fall through to the next layer.
        next();
    };

};

function format(str, req, res) {
    return str
        .replace(':url', req.url)
        .replace(':method', req.method)
        .replace(':status', res.statusCode)
        .replace(':response-time', res.responseTime)
        .replace(':referrer', req.headers['referer'] || req.headers['referrer'] || '')
        .replace(':http-version', req.httpVersionMajor + '.' + req.httpVersionMinor)
        .replace(':remote-addr', req.socket && req.socket.remoteAddress)
        .replace(':user-agent', req.headers['user-agent'] || '')
        .replace(/:req\[([^\]]+)\]/g, function(_, header){ return req.headers[header]; })
        .replace(/:res\[([^\]]+)\]/g, function(_, header){ return res._headers[header]; });
}

exports.weblogger = weblogger;
