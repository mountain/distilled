var _ = require('../lib/underscore');
var path = require('path');
var fs = require('fs');
var sys = require('sys');

var parser   = require('../vendors/htmlparser/lib/htmlparser'),
    jsdom    = require('../vendors/jsdom/lib/jsdom');

exports.create = function(html) {
    return new Magazine(html);
};

function Magazine(html) {
    this.document = jsdom.jsdom(html, undefined, {parser: parser});
    this.window   = this.document.createWindow();
    jsdom.jQueryify(window, "../lib/jquery.js");
    this.$ = this.window.$;
}

function solveTitle(title, href) {
    var link   = decodeURIComponent(href.substring(prefix)).replace('_', ' '),
    result = /[^\/]+$/.exec(link);
    titleMap[title] = result?result[0]:link;
    sys.puts('map ' + title + ' to ' + titleMap[title]);
}

var feature, featurepic, good, itn, dyk, otd;
function getfeature() {
    if (!feature) {
        var a = this.$('#column-feature b > a');
        feature = a.attr('title');
        var href = a.attr('href');
        solveTitle(feature, href);
    }
    return feature;
}
function getfeaturepic() {
    if (!featurepic) {
        var a = this.$('#column-featurepic b > a');
        featurepic = a.attr('title');
        var href = a.attr('href');
        solveTitle(featurepic, href);
    }
    return featurepic;
}
function getgood() {
    if (!good) {
        var a = this.$('#column-good b > a');
        good = a.attr('title');
        var href = a.attr('href');
        solveTitle(good, href);
    }
    return good;
}
function getitn() {
    if (!itn) {
        itn =  _(window.$('#column-itn b > a')).map(function (a) {
            var title = this.$(a).attr('title');
            var href = this.$(a).attr('href');
            solveTitle(title, href);
            return title;
        });
    }
    return itn;
}
function getdyk() {
    if (!dyk) {
        dyk =  _(window.$('#column-dyk b > a')).map(function (a) {
            var title = this.$(a).attr('title');
            var href = this.$(a).attr('href');
            solveTitle(title, href);
            return title;
        });
    }
    return dyk;
}
function getotd() {
    if (!otd) {
        otd =  _(window.$('#column-otd b > a')).map(function (a) {
            var title = this.$(a).attr('title');
            var href = this.$(a).attr('href');
            solveTitle(title, href);
            return title;
        });
        if (otd) {
            otd = otd[0];
        }
    }
    return otd;
}


