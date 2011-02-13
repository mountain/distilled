var logger = require('../../lib/log').logger,
    Builder = require("./route_builder");

var step = require('step'),
    connect = require('connect');

exports.start = function (root) {
    var env = { path: root };

    step(
      function () {
          require('./config').load(env, this);
      },
      function () {
          require('./template').load(env, this);
      },
      function (err) {
          if (err) {
              throw err;
          }

          var loadHandler = function (name) {
                  logger.info("loading controller " + name);
                  var path = ["../../", 'app', 'controllers', name].join('/');
                  return require(path)(env);
              },
              authenticate = function (realm) {
                  return function (user, pass) {
                      u = env.auths.users[user];
                      return u && u.password === pass
                               && u.realms.some(function (el) {
                                   return el === realm;
                               });
                  };
              },
              withRealm = function (realm, handler) {
                  return function (req, res) {
                      connect.basicAuth(authenticate(realm))(
                          req, res, function () { handler(req,res) }
                      );
                  };
              };

          var builder = new Builder(),
              routes = function (app) {
                  eval(builder.build(env.routes));
              },
              server = connect.createServer(
                  connect.logger({format:env.log.format}),
                  connect.staticProvider(env.path + 'public'),
                  connect.bodyDecoder(),
                  connect.methodOverride(),
                  connect.conditionalGet(),
                  connect.router(routes)
              );

          logger.info("starting on http://" + env.server.host + ":" + env.server.port);
          server.listen(env.server.port, env.server.host);
      }
    );
}
