exports.app = function(env) {
  var issue = env.templates.issue;
  return function(req, res, next) {
      var year = req.params.year;
      var month = req.params.month;
      var day = req.params.day;
      try{
          res.writeHead(200, {
              'Content-Type': 'text/html'
          });
          res.end(issue({year: year, month: month, day: day}));
      } catch(e) {
      }
  };
};


