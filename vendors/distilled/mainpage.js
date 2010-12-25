var _ = require('../lib/underscore');

var path = require('path');
var fs = require('fs');
var sys = require('sys');

var logger = require('../../lib/log').logger;

var parser   = require('../vendors/htmlparser/lib/htmlparser'),
    jsdom    = require('../vendors/jsdom/lib/jsdom');

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
    this.articleMap = {};

    var self = this,
        prefix = config.wiki.length + 2;
    _.each(['feature', 'featurepic', 'good', 'itn', 'dyk', 'otd'],
    function (col) {
        self[col] = _(this.window.$('#column-' + col + ' b > a')).map(
        function (a) {
            a = this.$(a);
            var title = a.attr('title'),
                href = a.attr('href'),
                article = solveLink(href.substring(prefix));
            this.titleMap[title] = article;
            this.articleMap[article] = title;
            return title;
        });
    });
    _.each(['feature', 'featurepic', 'good', 'otd'], function (col) {
        if(self[col]) {
            self[col] = self[col][0];
        }
    });

    this.index = {};
    this.index.feature = this.feature;
    this.index.good = this.good;
    this.index.featurepic = this.featurepic;
    this.index.dyk = this.dyk;
    this.index.itn = this.itn;
    this.index.otd = this.otd;

    this.titles = _(this.index).chain().flattern().unique().value();
    this.articles = _(this.titles).map(function (title) {
        return this.article(title);
    }).value();
}

var uploadpattern =
  /^(http:\/\/upload\.wikimedia\.org)(\/wikipedia\/\w+)(\/thumb)(\/\w+)(\/\w+\/)([\w\-\.]+[^#?\s]+)$/;

function filename(src) {
    var result = uploadpattern.exec(src);
    if (!result) {
        return "";
    } else {
        var filepath = result[result.length - 1].split("/");
        return filepath[0].replace('_', ' ');
    }
}

MainPage.prototype.photo = function (column) {
    var src = window.$('#column-' + column + ' div > a > img').attr('src');
    return filename(src);
};

MainPage.prototype.article = function (title) {
    return this.titleMap[title];
};

MainPage.prototype.title = function (article) {
    return this.articleMap[article];
};

exports.create = function (config, html) {
    return new MainPage(config, html);
};


