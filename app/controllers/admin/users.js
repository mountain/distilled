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
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(templates.empty());
            } catch (e) {
                sys.puts(e.stack);
            }
        },
        show: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(templates.empty());
            } catch (e) {
                sys.puts(e.stack);
            }
        },
        edit: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(templates.empty());
            } catch (e) {
                sys.puts(e.stack);
            }
        },
        update: function (req, res, next) {
            sys.puts('hello world!');
            var id = req.params.id,
            field = _.keys(req.body)[0];
            sys.puts(sys.inspect(req.params));
            sys.puts(sys.inspect(req.body));
            if (field === 'pwd') {
                env.users[id] = req.body[field];
                res.end(env.users[id]);
            } else {
                realms[id] = req.body[field].split(',');
                res.end(realms[id]);
            }
        },
        destroy: function (req, res, next) {
        }
    };
};
