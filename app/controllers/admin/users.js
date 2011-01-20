var _ = require('../../../lib/underscore')._;
var logger = require('../../../lib/log').logger;

var sys = require('sys');

var environment = require('../../../vendors/minimal/environment');

exports.app = function (env) {
    var templates = env.templates.admin.users, realms = {};

    environment.visit(env.auths, function (realm, users) {
        _.each(users, function (user) {
            if(!realms[user]) {
                realms[user] = [];
            }
            realms[user].push(realm.substring('distilled-realm-'.length));
        })
    });

    return {
        index: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(templates.index({
                  users: _.keys(env.users),
                  pwd: env.users,
                  realms: realms
                }));
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
            try {
            } catch (e) {
                sys.puts(e.stack);
            }
        },
        show: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(templates.show());
            } catch (e) {
                sys.puts(e.stack);
            }
        },
        edit: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(templates.edit());
            } catch (e) {
                sys.puts(e.stack);
            }
        },
        update: function (req, res, next) {
            var id = req.params.id,
                value = req.body.value,
                field = req.body.id.split('-')[1];
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            if (field === 'pwd') {
                env.users[id] = value;
                res.end(value);
            } else {
                realms[id] = value.split(',');
                res.end(value);
            }
        },
        destroy: function (req, res, next) {
        }
    };
};
