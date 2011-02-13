var _ = require('underscore'),
    logger = require('../../lib/log').logger;

var fs = require("fs"),
    path = require("path");


/**
 *  Asynchronous directory traversal in node.js
 *  Original by stygstra
 *  Modified by mountain
 *  https://gist.github.com/514983
 */

exports.walk = (function() {
    var counter = 0;
    var walk = function(dirname, context, callback, finished) {
        counter += 1;
        fs.readdir(dirname, function(err, relnames) {
            if(err) {
                finished(err);
                return;
            }
            relnames.forEach(function(relname, index, relnames) {
                var name = path.join(dirname, relname);
                counter += 1;
                fs.stat(name, function(err, stat) {
                    if(err) {
                        finished(err);
                        return;
                    }
                    if(stat.isDirectory()) {
                        context[relname] = {};
                        exports.walk(name, context[relname], callback, finished);
                    } else {
                        callback(name, context, relname);
                    }
                    counter -= 1;
                    if(index === relnames.length - 1) counter -= 1;
                    if(counter === 0) {
                        finished(null);
                    }
                });
            });
        });
    };
    return walk;
})();

/**
 *  Visit object hierachy structure
 */

function visitEntry (pkey, context, callback) {
    _(context).chain().keys().each(function (key) {
        var entry = context[key], curkey = pkey?(pkey + '.' + key):key;
        if(_.isFunction(entry) || _.isString(entry) || _.isBoolean(entry) ||
           _.isArray(entry) || _.isNumber(entry) || _.isRegExp(entry)) {//entry is a leaf node
            callback(curkey, entry);
        } else {//entry is not a leaf node
            visitEntry (curkey, entry, callback)
        }
    });
}

exports.visit = function (context, callback) {
    visitEntry(undefined, context, callback);
};


/**
 *  Access object hierachy structure
 */

function accessEntry (context, keys) {
    _.each(keys, function (key) {
        if (context) {
            context = context[key];
        }
    });
    return context;
}

exports.access = function (context, key) {
    return accessEntry(context, key.split('.'));
};


/**
 *  Save config
 */

exports.saveConfig = function (path, obj) {
    fs.write(path, "exports.settings = " + JSON.stringify(obj) + ";");
};
