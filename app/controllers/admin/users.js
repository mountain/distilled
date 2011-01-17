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
    sys.puts(sys.inspect(realms));

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
