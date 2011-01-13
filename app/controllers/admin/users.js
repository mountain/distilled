var templates =
        require('../../../vendors/minimal/template').forCtrl(__filename);

exports.app = function (env) {
    var index = templates.load('./index'),
        empty = templates.load('./empty'),
        show = templates.load('./show'),
        edit = templates.load('./edit');

    return {
        index: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(index());
            } catch (e) {
                require('sys').puts(e.stack);
            }
        },
        empty: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(empty());
            } catch (e) {
                require('sys').puts(e.stack);
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
