var _ = require('../lib/underscore')._;


exports.app = function(env) {
  return function(req, res, next) {
      var style = env.templates.style,
          query = require('url').parse(req.url, true).query,
          ctx   = _({width: 1024, height: 768}).extends(query);

      res.writeHead(200, {
          'Content-Type': 'text/css'
      });
      res.end(style(ctx));
  };
};
