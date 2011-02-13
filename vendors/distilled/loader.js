var _ = require('underscore');

var http = require('http'),
    path = require('path'),
    fs   = require('fs'),
    sys  = require('sys');

var logger = require('../minimal/logger');

function Loader(lang, variant) {
    this.lang = lang;
    this.variant = variant;
    this.host = lang + '.wikipedia.org';
}

Loader.prototype.fetch = function (title, callback) {
    var path = '/w/api.php?page=' + encodeURIComponent(title) +
            '&props=text&action=parse&variant=' + this.variant + '&format=json';
    var wp = http.createClient(80, this.host);
    var request = wp.request('GET', path,
        {
            'host': this.host,
            'User-Agent': 'WpDistilled'
        }
    );
    logger.info("request on:" + title);
    request.end();

    request.on('response', function (response) {
        response.setEncoding('utf-8');
        var body = "";
        response.on('data', function (chunk) {
            chunk = chunk.toString('utf8');
            body = body + chunk;
        });
        response.on('end', function () {
            try {
                var data = JSON.parse(body);
                if (callback) {
                    logger.info("response on:" + title);
                    callback(title, data.parse);
                }
                body = '';
            } catch (e) {
                logger.error("error:" + e);
                logger.error(e.stack.toString());
                body = '';
            }
        });
    });
};

Loader.prototype.solveRedirect = function (title, callback) {
    var path = '/w/api.php?titles=' + encodeURIComponent(title) + '&redirects&action=query&format=json';

    var wp = http.createClient(80, this.host);
    var request = wp.request('GET', path,
        {
            'host': this.host,
            'User-Agent': 'WikipediaDistilled'
        }
    );
    request.end();

    request.on('response', function (response) {
        response.setEncoding('utf-8');
        var body = "";
        response.on('data', function (chunk) {
            chunk = chunk.toString('utf8');
            body = body + chunk;
        });
        response.on('end', function () {
            try {
                var data = JSON.parse(body);
                if (callback) {
                    var to = title;
                    if (data.query.redirects) {
                        to = data.query.redirects[0].to;
                    } else {
                        to = title;
                    }
                    logger.info('redirect from:' + title + ' to ' + to);
                    callback(title, to);
                }
                body = '';
            } catch (e) {
                body = '';
            }
        });
    });
};

Loader.prototype.load = function (title, cbredirect, cbfetch) {
    var self = this;
    this.solveRedirect(title, function (from, to) {
        cbredirect(from, to);
        self.fetch(to, cbfetch);
    });
};

Loader.prototype.batchload = function (titles, cbredirect, cbfetch, cbfinal) {
    var self = this, ind = 0, handle;
    function fetching() {
        var len = titles.length;
        if (ind < len) {
            self.load(titles[ind], cbredirect, cbfetch);
            ind++;
        } else {
            clearInterval(handle);
            logger.info("final step start");
            cbfinal();
        }
    }
    handle = setInterval(fetching, 30000);
};

exports.create = function (lang, variant) {
    return new Loader(lang, variant);
};

