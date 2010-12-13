var _ = require('../lib/underscore')._;


exports.app = function(env) {
  return function(req, res, next) {
      var style  = env.templates.style,
          query  = require('url').parse(req.url, true).query,
          width  = query.width || 1024,
          height = query.height || 768,
          grid   = 30;

      var ratio = height / width;
      if (ratio > 0.618) {
          //when screen is fatter than magazine, we will span magazin fully in
          //horizental direction
          width = Math.ceil(width * 0.8);
          height = Math.ceil(width * 0.618);
      } else {
          //when screen is thinner than magazine, we will span magazin fully in
          //vertical direction
          height = Math.ceil(height * 0.8);
          width = Math.ceil(height / 0.618);
      }

      var gwidth  = Math.ceil(width * 0.48 * 0.96 / grid),
          gheight = Math.ceil(height * 0.96 * 0.96 / grid);

      res.writeHead(200, {
          'Content-Type': 'text/css'
      });
      res.end(style({width: width, height: height,
      gwidth: gwidth, gheight: gheight, grid: grid}));
  };
};
