var sys = require('sys');

var templates =
        require('../../../vendors/minimal/template').forCtrl(__filename);

exports.app = function (env) {
    templates = templates(env);

    return {
        index: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(templates.index());
            } catch (e) {
                sys.puts(e.stack);
            }
        },
        empty: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(templates.empty());
            } catch (e) {
                sys.puts(e.stack);
            }
        },
        create: function (req, res, next) {
        },
        show: function (req, res, next) {
        },
        edit: function (req, res, next) {
        },
        update: function (req, res, next) {
        },
        destroy: function (req, res, next) {
        }
    };
};
