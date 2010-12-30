var _ = require('../../lib/underscore')._;
var logger = require('../../lib/log').logger;

var sys = require('sys');

exports.load = function(callback, env) {
    env.templates = {};

    var fs = require('fs'),
      tmplPath = env.path + 'app/templates';
    logger.info('loading tempaltes at ' + tmplPath);
    fs.readdir(tmplPath, function (err, files) {
        if (err) {
            logger.error('No template found (' + err + ') at ' + tmplPath);
        } else {
            files = _(files).select(function (file) {
                return file.match(/.+\.erb$/);
            });

            var len = files.length;
            var ind = 0;
            _(files).each(function (file) {
                fs.readFile(env.path + 'app/templates/' + file,
                    function (err, data) {
                        if (!err) try {
                            var tmpl = file.substring(0, file.length - 4);
                            env.templates[tmpl] = _.template(
                              data.toString('utf8', 0, data.length)
                            );
                            logger.info('loading template: ' + tmpl);
                        } catch (e) {
                            logger.error('Error parsing template: ' + e);
                        }
                        if (ind === len - 1) {
                            callback();
                        } else {
                            ind++;
                        }
                    }
                );
            });
        }
    });
}

