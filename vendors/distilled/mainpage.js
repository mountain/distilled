var _ = require('../lib/underscore');
var path = require('path');
var fs = require('fs');
var sys = require('sys');

var logger = require('../../lib/log').logger;

var parser   = require('../vendors/htmlparser/lib/htmlparser'),
    jsdom    = require('../vendors/jsdom/lib/jsdom');

exports.create = function(config, html) {
    return new MainPage(config, html);
};

function solveLink(href) {
    var link   = decodeURIComponent(href).replace('_', ' '),
    result = /[^\/]+$/.exec(link);
    return result?result[0]:link;
}

function MainPage(config, html) {
    this.config = config;
    this.document = jsdom.jsdom(html, undefined, {parser: parser});
    this.window   = this.document.createWindow();
    jsdom.jQueryify(this.window, "../lib/jquery.js");
    this.$ = this.window.$;

    this.titleMap = {};

    var self = this,
        prefix = config.wiki.length + 2;
    _.each(['feature', 'featurepic', 'good', 'itn', 'dyk', 'otd'],
    function (col) {
        self[col] = _(this.window.$('#column-' + col + ' b > a')).map(
        function (a) {
            var title = this.$(a).attr('title');
            var href = this.$(a).attr('href');
            this.titleMap[title] = solveLink(href.substring(prefix));
            return title;
        });
    });
    _.each(['feature', 'featurepic', 'good', 'otd'], function (col) {
        if(self[col]) {
            self[col] = self[col][0];
        }
    });
}

