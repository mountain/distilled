exports.app = function(env) {
  return function(req, res, next) {
      var date = new Date(),
          year = date.getUTCFullYear(),
          month = date.getUTCMonth() + 1,
          day = date.getUTCDate();

      var main = env.templates.main;
      res.writeHead(200, {
          'Content-Type': 'text/html'
      });
      res.end(main({year: year, month: month, day: day}));
  };
};


