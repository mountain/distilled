var _ = require('../../lib/underscore')._;
var logger = require('../../lib/log').logger;

var step   = require('../../lib/step'),
    connect = require('../connect/lib/connect');

var environment = require('./environment'),
    controller  = require('./controller');

function loadApp(env, app, key) {
    logger.info('key = ' + key);
    var applet = environment.access(env.controllers, key)(env);
    if (_.isFunction(applet)) {
        logger.info('load app.get at ' + key);
        app.get(env.routers[key], applet);
    } else if (applet.index) {
        logger.info('load resource at ' + key);
        app.get(env.routers[key], applet.index);
        app.post(env.routers[key], applet.create);
        app.get(env.routers[key] + '/empty', applet.empty);
        app.get(env.routers[key] + '/:id/edit', applet.edit);
        app.get(env.routers[key] + '/:id', applet.show);
        app.put(env.routers[key] + '/:id', applet.update);
        app.delete(env.routers[key] + '/:id', applet.destroy);
    } else {
        logger.info('load app at ' + key);
        if (applet.get) {
            app.get(env.routers[key], applet.get);
        }
        if (applet.post) {
            app.post(env.routers[key], applet.post);
        }
        if (applet.put) {
            app.put(env.routers[key], applet.put);
        }
        if (applet.delete) {
            app.delete(env.routers[key], applet.delete);
        }
    }
}

function getRealms(env) {
    var realms = {'_': []};
    environment.visit(env.realms, function(key, value) {
        if(!realms[value]) {
            realms[value] = [];
        }
        realms[value].push(key);
    });
    environment.visit(env.routers, function(key, value) {
        if (!environment.access(env.realms, key)) {
            realms['_'].push(key);
        }
    });
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
                      loadApp(env, app(realm), appkey);
                  });
              }
          });

          server.listen(env.server.port, env.server.host);
      }
    );

}


