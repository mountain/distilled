var _ = require('../../lib/underscore')._;
var logger = require('../../lib/log').logger;

var sys = require('sys');

var step   = require('../../lib/step'),
    connect = require('../connect/lib/connect');

var environment = require('./environment'),
    controller  = require('./controller');

function loadApp(env, app, key) {
    var applet = environment.access(env.controllers, key)(env),
        route = environment.access(env.routers, key);
    if (_.isFunction(applet)) {
        logger.info('load app.get at ' + key);
        app.get(route, applet);
    } else if (applet.index) {
        logger.info('load resource at ' + key);
        app.get(route, applet.index);
        app.post(route, applet.create);
        app.get(route + '/empty', applet.empty);
        app.get(route + '/:id/edit', applet.edit);
        app.get(route + '/:id', applet.show);
        app.put(route + '/:id', applet.update);
        app.delete(route + '/:id', applet.destroy);
    } else {
        logger.info('load app at ' + key);
        if (applet.get) {
            app.get(route, applet.get);
        }
        if (applet.post) {
            app.post(route, applet.post);
        }
        if (applet.put) {
            app.put(route, applet.put);
        }
        if (applet.delete) {
            app.delete(route, applet.delete);
        }
    }
}

function getRealms(env) {
    var realms = {'_': []}, underRealms = [];
    environment.visit(env.routers, function(routekey, route) {
        environment.visit(env.realms, function(realmkey, realm) {
            if (routekey.indexOf(realmkey) !== -1) {
                if(!realms[realm]) {
                    realms[realm] = [];
                }
                if (realms[realm].indexOf(routekey) === -1) {
                    realms[realm].push(routekey);
                    underRealms.push(routekey);
                }
            }
        });
    });

    environment.visit(env.routers, function(routekey, route) {
        if (underRealms.indexOf(routekey) === -1) {
            realms['_'].push(routekey);
        }
    });
    sys.puts(sys.inspect(realms));
    return realms;
}

function auth(env, realm) {
    var auths = env.auths, usersInRealm = auths[realm], users = env.users;
    return function (user, pass) {
        return usersInRealm && user && pass &&
          _(usersInRealm).indexOf(user) !== -1 &&
          users[user] === pass;
    };
}

exports.start = function (path) {
    var env = { path: path };

    step(
      function () {
          require('./config').load(env, this);
      },
      function () {
          require('./template').load(env, this);
      },
      function () {
          controller.load(env, this);
      },
      function (err) {
          if (err) {
              throw err;
          }

          var realms = getRealms(env);
          function plainRoutes(app) {
              _(realms['_']).each(function (key) {
                  loadApp(env, app, key);
              });
          }

          var server = connect.createServer(
              connect.logger(),
              connect.conditionalGet(),
              connect.router(plainRoutes),
              connect.staticProvider(env.path + 'public')
          );

          var load = function (realm) {
              return function (route, handler) {
                  server.use(route,
                      connect.basicAuth(auth(env, realm), realm), handler);
              };
          };
          var app = function (realm) {
              return {
                  get: load(realm),
                  put: load(realm),
                  post: load(realm),
                  delete: load(realm)
              };
          };

          _(realms).chain().keys().each(function (realm) {
              if(realm !== '_') {
                  _.each(realms[realm], function (appkey) {
                          logger.info('load app[' + appkey + '] under ' + realm);
                      loadApp(env, app(realm), appkey);
                  });
              }
          });

          server.listen(env.server.port, env.server.host);
      }
    );

}


