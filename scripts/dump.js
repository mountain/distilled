var _ = require('../lib/underscore');
var path = require('path');
var fs = require('fs');
var sys = require('sys');


var uploadpattern =
  /^(http:\/\/upload\.wikimedia\.org)(\/wikipedia\/\w+)(\/thumb)(\/\w+)(\/\w+\/)([\w\-\.]+[^#?\s]+)$/;

function thumburl(src, width) {
    width = width || 50;
    var result = uploadpattern.exec(src);
    if(!result) return "";
    var filepath = result[result.length - 1].split("/");
    filepath[1] = filepath[1].replace(/^\d+px-/, width + "px-");
    result[result.length - 1] = filepath.join("/");
    result.shift();
    return result.join('');
}

function originurl(src) {
    var result = uploadpattern.exec(src);
    if(!result) return "";
    var filepath = result[result.length - 1].split("/");
    return [result[1], result[2], result[4], result[5], filepath[0]].join("");
}

function cover() {
    var src = window.$('#column-good div > a > img').attr('src');
    window.$('#cover-photo').html('<img src="' + originurl(src) + '"/>');

    window.$('#cover-top ul').append(window.$('<li>' + index.feature + '</li>'));
    window.$('#cover-top ul').append(window.$('<li>' + index.good + '</li>'));
    window.$('#cover-top ul').append(window.$('<li>' + index.featurepic + '</li>'));

    _(index.itn).each(function (n) {
        window.$('#cover-right ul').append(window.$('<li>' + n + '</li>'));
    });

    _(index.dyk).each(function (k) {
        window.$('#cover-left ul').append(window.$('<li>' + k + '</li>'));
    });
}

function toc() {
    var toc = config.toc;
    _(toc).chain().map(function (item) {
        return index[item];
    }).flatten().unique().each(function (title) {
        var id = pageId(title);
        if(title && id) {
           window.$('#contents').append(window.$('#' + id));
           window.$('#' + id).prepend(window.$('<h1>' + title + '</h1>'));
           sys.puts('move ' + title + ':' + id);
        }
    });
}

function contents() {
    var toc = config.toc;
    _(toc).chain().map(function (item) {
        return index[item];
    }).flatten().unique().each(function (title) {
        var id = pageId(title);
        if(title && id) {
           window.$('#contents').append(window.$('#' + id));
           window.$('#' + id).prepend(window.$('<h1>' + title + '</h1>'));
           sys.puts('move ' + title + ':' + id);
        }
    });
}

function mkdir(path) {
    var pathSegments= path.split("/");
    sys.puts(pathSegments);
    if (pathSegments[0] === '') {
        pathSegments= pathSegments.slice(1);
    }
    for(var i=0; i<=pathSegments.length; i++) {
        var pathSegment= "/"+pathSegments.slice(0,i).join("/");
        try {
            fs.statSync(pathSegment);
        }
        catch(e) {
            fs.mkdirSync(pathSegment, 0777);
        }
    }
}

function fixArticle(title, data) {
    var id = pageId(redirectMap[title]);
    window.$('#' + id + ' .toc').remove();
    window.$('#' + id + ' .editsection').remove();
    window.$('#' + id + ' .metadata').remove();
    window.$('#' + id + ' .navbox').remove();
    window.$('#' + id + ' .infobox').remove();
    window.$('#' + id + ' .topicon').remove();
    window.$('#' + id + ' table:first-child[class="wikitable"]').remove();

    window.$('#' + id + ' .thumb').removeClass('tright').removeClass('tleft');

    window.$('#' + id + ' a').each(function (i, a) {
        var href = window.$(a).attr('href');
        href = 'http://zh.wikipedia.org' + href;
        window.$(a).attr('href', href);
    });

    count++;
    sys.puts('progress:' + count + '/' + tasknum);
    if (count === tasknum) {
        contents();
        saveHtml(window.$('#contents').html());
    }
}

function loadMain(callback) {
    sys.puts("start loading main");
    load(config.lang, config.variant, config.mainpage, function (title, data) {
        window.$('#mainpage').append(window.$(data.text['*']));

        index.feature = config.feature || getfeature();
        index.good = config.good || getgood();
        index.featurepic = config.featurepic || getfeaturepic();
        index.dyk = config.dyk || getdyk();
        index.itn = config.itn || getitn();
        index.otd = config.otd || getotd();

        var json = _.clone(index);
        json.toc = config.toc;
        saveJson(JSON.stringify(json));

        articles = _(index).chain().values().flatten().uniq().value();
        tasknum = articles.length;

        cover();

        toc();

        if (callback) {
            callback(title, data);
        }
    });
}


