var _ = require('underscore');

var logger = require('./logger'),
    mysql = require('./mysql'),
    redis = require('./redis');

exports.init = function (callback, env, filter) {
    env.conns = {};
    logger.info('init db connections.');
    _(env.db).chain().keys()
    .select(filter || function() { return true; } )
    .each(function (key) {
        var url = env.db[key], dbType = url.split(':')[0];
        if (dbType === 'mysql') {
            env.conns[key] = mysql.connectByUrl(url);
        } else if (dbType === 'redis') {
            env.conns[key] = redis.connectByUrl(url);
        }
    });
    callback(undefined);
};

