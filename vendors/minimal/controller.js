var _ = require('../../lib/underscore')._;
var logger = require('../../lib/log').logger;

var walk = require('./environment').walk;

function loadCtrl(env) {
    var len = env.path.length;
    return function (path, context, name) {
        var ctrlPath = '../../' + path.substring(len);
        ctrlPath = ctrlPath.substring(0, ctrlPath.length - 3);
        name = name.substring(0, name.length - 3);
        logger.info('loading controller ' + name + ' at ' + ctrlPath);
        context[name] = require(ctrlPath).app;
    };
}

exports.load = function(env, callback) {
    logger.info('loading controllers...');
    var ctx = (env.controllers = {});
    walk(env.path + 'app/controllers', ctx, loadCtrl(env), callback);
};


