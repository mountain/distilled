var _ = require('../../lib/underscore')._;
var logger = require('../../lib/log').logger;
var redis = require('../node_redis');

function connect(host, port, db) {
    var client = redis.createClient(port, host);
    if(db) client.select(db);
    var url = 'redis://' + host + ':' + port + '/' + db;
    logger.info('connected to ' + url);
    return client;
}

function connectByUrl (url) {
    var parsed = require('url').parse(url),
        db = parsed.pathname.substring(1);
    db = parseInt(db);
    if(parsed.protocol !== 'redis:') throw 'wrong protocol for redis!'

    return connect(parsed.hostname, parsed.port, db);
}

exports.connect = connect;
exports.connectByUrl = connectByUrl;
