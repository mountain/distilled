exports.app = function(env) {
  return function(req, res, next) {
      var main = env.templates.main;
      res.writeHead(200, {
          'Content-Type': 'text/html'
      });
      res.end(main({}));
  };
};


