var _ = require('../../lib/underscore')._;
var logger = require('../../lib/log').logger;

var sys    = require('sys'),
    step   = require('../../lib/step'),
    connect = require('../connect/lib/connect');

function loadApp(env, app, key) {
    var applet = require('../../app/' + key).app(env);
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
    _(env.realms).chain().keys().each(function (appkey) {
        if (!realms[env.realms[appkey]]) {
            realms[env.realms[appkey]] = [];
        }
        realms[env.realms[appkey]].push(appkey);
    });
    _(env.routers).chain().keys().each(function (appkey) {
        if (!env.realms[appkey]) {
            realms['_'].push(appkey);
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
    var env = { path: path, lang: 'zh',
      conn: function (key) {
        return this.conns[key];
      }
    };

    step(
      function () {
          require('./config').load(this, env);
      },
      function () {
          require('./template').load(this, env);
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


