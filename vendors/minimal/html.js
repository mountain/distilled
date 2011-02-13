var _ = require('underscore');

exports.htmlDir = function(env, lang) {
  return _.indexOf(env.i18n.rtl, lang) === -1 ? 'ltr' : 'rtl';
}
