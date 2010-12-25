var _ = require('../lib/underscore');

var path = require('path');
var fs = require('fs');
var sys = require('sys');

var parser   = require('../vendors/htmlparser/lib/htmlparser'),
    jsdom    = require('../vendors/jsdom/lib/jsdom');

function pageId(title) {
    if (title) {
        return 'article-' + title.replace(' ', '_')
          .replace(':', '_').replace('(', '_').replace(')', '_');
    } else {
        return '';
    }
}

function Magazine(index, html) {
    this.index = index;
    this.toc = {};
    this.document = jsdom.jsdom(html, undefined, {parser: parser});
    this.window   = this.document.createWindow();
    jsdom.jQueryify(window, "../lib/jquery.js");
    this.$ = this.window.$;
}

Magazine.prototype.coverphoto = function (photo) {
    this.$('#cover-photo').html('<img data="' + photo + '"/>');
};

Magazine.prototype.fixArticle = function (title) {
    var id = pageId(title);
    this.$('#' + id + ' .toc').remove();
    this.$('#' + id + ' .editsection').remove();
    this.$('#' + id + ' .metadata').remove();
    this.$('#' + id + ' .navbox').remove();
    this.$('#' + id + ' .infobox').remove();
    this.$('#' + id + ' .topicon').remove();
    this.$('#' + id + ' table:first-child[class="wikitable"]').remove();

    this.$('#' + id + ' .thumb').removeClass('tright').removeClass('tleft');

    this.$('#' + id + ' a').each(function (i, a) {
        var href = this.$(a).attr('href');
        href = 'http://zh.wikipedia.org' + href;
        this.$(a).attr('href', href);
    });
};

Magazine.prototype.addArticle = function (title, content) {
    this.$('#articles').append(
        this.$('<div id=' + pageId(title) + '>' + content + '</div>')
    );
    this.fixArticle(title);
};

Magazine.prototype.mkCover = function () {
    this.$('#cover-top ul').append(this.$('<li>' + this.index.feature + '</li>'));
    this.$('#cover-top ul').append(this.$('<li>' + this.index.good + '</li>'));
    this.$('#cover-top ul').append(this.$('<li>' + this.index.featurepic + '</li>'));

    _(this.index.itn).each(function (n) {
        this.$('#cover-right ul').append(this.$('<li>' + n + '</li>'));
    });

    _(this.index.dyk).each(function (k) {
        this.$('#cover-left ul').append(this.$('<li>' + k + '</li>'));
    });
};

Magazine.prototype.mkToc = function (toc) {
    _(toc).each(function (item) {
        var items = '<ul>';
        _.each(this.index[item], function (title) {
            item += '<li>' + title + '</li>';
            if (this.toc[item] === undefined) {
                this.toc[item] = [];
            }
            this.toc[item].push(title);
        });
        item += '</ul>';
        this.$('#toc-' + item).append(items);
    });
};

Magazine.prototype.mkContents = function (toc) {
    _(toc).chain().map(function (item) {
        return this.index[item];
    }).flatten().unique().each(function (title) {
        var id = pageId(title);
        if (title && id) {
            this.$('#contents').append(this.$('#' + id));
            this.$('#' + id).prepend(this.$('<h1>' + title + '</h1>'));
        }
    });
};

Magazine.prototype.makeup = function (option) {
    this.mkCover();
    this.mkToc(option.toc);
    this.mkContent(option.toc);
};

Magazine.prototype.html = function () {
    return this.$('#contents').html();
};

exports.create = function (html) {
    return new Magazine(html);
};

