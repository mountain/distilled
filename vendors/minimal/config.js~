require('../../lib/underscore');
require('../../lib/log');

exports.load = function(callback, env) {
    var fs = require('fs')
        path = env.path + 'config';
    logger.info('loading config at ' + path);
    fs.readdir(path, function(err, files) {
        if (err) {
            logger.error('No config found (' + err + ') at ' + path);
        } else {
            _(files).chain().select(
                function(file) { return file.match(/.+\.js$/); }
            ).each(
                function(file) {
                    var name = file.substring(0, file.length - 3);
                    env[name] = require('../../config/' + name).settings;
                }
            );
            callback();
        }
    });
}

