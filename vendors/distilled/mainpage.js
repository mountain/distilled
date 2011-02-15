var path = require('path'),
    fs = require('fs'),
    sys = require('sys');

var logger = require('../../lib/log').logger;

var _ = require('underscore'),
    parser = require('htmlparser'),
    jsdom  = require('jsdom');

var jqueryPath = __dirname + "/jquery.js";

function solveLink(href) {
    var link   = decodeURIComponent(href).replace('_', ' '),
    result = /[^\/]+$/.exec(link);
    return result?result[0]:link;
}

function MainPage(config, html, cbReady) {
    this.config = config;
    html = '<html><head></head><body>' + html + '</body></html>';
    this.document = jsdom.jsdom(html, undefined, {parser: parser});
    this.window   = this.document.createWindow();

    this.titleMap = {};
    this.articleMap = {};
    this.summary = {};

    var self = this,
        prefix = config.wiki.length + 2;

    function onready() {
        _.each(['feature', 'featurepic', 'good', 'itn', 'dyk', 'otd'],
        function (col) {
            self[col] = _(self.window.$('#column-' + col + ' b > a')).map(
            function (a) {
                a = self.window.$(a);
                var title = a.attr('title'),
                    href = a.attr('href'),
                    article = solveLink(href.substring(prefix)),
                    parents;
                self.titleMap[title] = article;
                self.articleMap[article] = title;
                if (col === 'itn' || col === 'dyk') {
                    parents = a.parentsUntil('li');
                    self.summary[title] = self.window.$(parents.pop()).html();
                } else {
                    parents = a.parentsUntil('div');
                    self.summary[title] = self.window.$(parents.pop()).html();
                }
                return title;
            });
        });
        _.each(['feature', 'featurepic', 'good', 'otd'], function (col) {
            if (self[col]) {
                self[col] = self[col][0];
            }
        });

        self.index = {};
        self.index.feature = self.feature;
        self.index.good = self.good;
        self.index.featurepic = self.featurepic;
        self.index.dyk = self.dyk;
        self.index.itn = self.itn;
        self.index.otd = self.otd;

        self.titles = _(self.index).chain().flatten().unique().value();
        self.articles = _(self.titles).map(function (title) {
            return self.article(title);
        });

        if (cbReady) {
            cbReady();
        }
    }

    jsdom.jQueryify(this.window, jqueryPath, function () {
        self.window.$(onready);
    });

}

var uploadpattern =
  /^(http:\/\/upload\.wikimedia\.org)(\/wikipedia\/\w+)(\/thumb)(\/\w+)(\/\w+\/)([^#?\s]+)$/;

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
    var src = this.window.$('#column-' + column + ' div > a > img').attr('src');
    return filename(decodeURIComponent(src));
};

MainPage.prototype.article = function (title) {
    return this.titleMap[title];
};

MainPage.prototype.title = function (article) {
    return this.articleMap[article];
};

exports.create = function (config, html, cbReady) {
    return new MainPage(config, html, cbReady);
};


