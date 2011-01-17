var _ = require('../../lib/underscore')._;
var logger = require('../../lib/log').logger;

var fs = require("fs");

var walk = require('./environment').walk;

function loadTmpl(path, context, name) {
    fs.readFile(path, function (err, data) {
        if (!err) try {
            name = name.substring(0, name.length - 4);
            context[name] = _.template(
              data.toString('utf8', 0, data.length)
            );
            logger.info('loading template: ' + path);
        } catch (e) {
            logger.error('Error parsing template: ' + e);
        }
    });
}

exports.load = function(env, callback) {
    logger.info('loading tempaltes...');
    var ctx = (env.templates = {});
    walk(env.path + 'app/templates', ctx, loadTmpl, callback);
};

exports.forCtrl = function (ctrlpath) {
    return function(env) {
        ctrlpath = ctrlpath.substring(env.path.length);
        parts = ctrlpath.split('/');
        logger.info(parts);
    };
};


