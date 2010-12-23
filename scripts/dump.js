var _ = require('../lib/underscore');
var path = require('path');
var fs = require('fs');
var sys = require('sys');

var parser   = require('../vendors/htmlparser/lib/htmlparser'),
    jsdom    = require('../vendors/jsdom/lib/jsdom'),
    document = jsdom.jsdom(
      '<html><head></head><body>' +
      '<div id="mainpage"></div>' +
      '<div id="articles"></div>' +
      '<div id="contents">' +
      '<div id="cover" class="leftpage">' +
      '<div id="cover-htitle">维基日刊</div>' +
      '<div id="cover-vtitle">维<br/>基<br/>日<br/>刊</div>' +
      '<div id="cover-photo"></div>' +
      '<div id="cover-top"><ul></ul></div>' +
      '<div id="cover-left"><ul></ul></div>' +
      '<div id="cover-right"><ul></ul></div>' +
      '</div>' +
      '<div id="tocpage" class="rightpage">' +
      '<div class="head-right">新闻</div>' +
      '<div class="toc-left"><ul id="toc-itn"></ul></div>' +
      '<div class="head-right">新知</div>' +
      '<div class="toc-left"><ul id="toc-dyk"></ul></div>' +
      '<div class="head-right">历史上的今天</div>' +
      '<div class="toc-left"><ul id="toc-otd"></ul></div>' +
      '<div class="head-right">特色</div>' +
      '<div class="toc-left"><ul id="toc-feature"></ul></div>' +
      '<div class="head-right">优良</div>' +
      '<div class="toc-left"><ul id="toc-good"></ul></div>' +
      '<div class="head-right">图像</div>' +
      '<div class="toc-left"><ul id="toc-featurepic"></ul></div>' +
      '</div>' +
      '</div>' +
      '</body></html>', undefined, {parser: parser}),
    window   = document.createWindow();

jsdom.jQueryify(window, "../lib/jquery.js");

var config = {
    lang: 'zh',
    variant: 'zh-cn',
    wiki: 'wiki',
    mainpage: 'Wikipedia:首页',
    colunmns: ['feature', 'good', 'featurepic', 'itn', 'dyk', 'otd'],
    cover: {},
    toc: ['itn', 'dyk', 'otd', 'feature', 'good', 'featurepic'],
    itn: undefined,
    dyk: undefined,
    otd: undefined,
    feature: undefined,
    good: undefined,
    featurepic: undefined,
    back: {}
};

var index = {}, articles = [], titleMap = {}, redirectMap = {};

var count = 0, tasknum = 0;

var prefix = config.wiki.length + 2;
function solveTitle(title, href) {
    var link   = decodeURIComponent(href.substring(prefix)).replace('_', ' '),
    result = /[^\/]+$/.exec(link);
    titleMap[title] = result?result[0]:link;
    sys.puts('map ' + title + ' to ' + titleMap[title]);
}

var feature, featurepic, good, itn, dyk, otd;
function getfeature() {
    if (!feature) {
        var a = window.$('#column-feature b > a');
        feature = a.attr('title');
        var href = a.attr('href');
        solveTitle(feature, href);
    }
    return feature;
}
function getfeaturepic() {
    if (!featurepic) {
        var a = window.$('#column-featurepic b > a');
        featurepic = a.attr('title');
        var href = a.attr('href');
        solveTitle(featurepic, href);
    }
    return featurepic;
}
function getgood() {
    if (!good) {
        var a = window.$('#column-good b > a');
        good = a.attr('title');
        var href = a.attr('href');
        solveTitle(good, href);
    }
    return good;
}
function getitn() {
    if (!itn) {
        itn =  _(window.$('#column-itn b > a')).map(function (a) {
            var title = window.$(a).attr('title');
            var href = window.$(a).attr('href');
            solveTitle(title, href);
            return title;
        });
    }
    return itn;
}
function getdyk() {
    if (!dyk) {
        dyk =  _(window.$('#column-dyk b > a')).map(function (a) {
            var title = window.$(a).attr('title');
            var href = window.$(a).attr('href');
            solveTitle(title, href);
            return title;
        });
    }
    return dyk;
}
function getotd() {
    if (!otd) {
        otd =  _(window.$('#column-otd b > a')).map(function (a) {
            var title = window.$(a).attr('title');
            var href = window.$(a).attr('href');
            solveTitle(title, href);
            return title;
        });
        if (otd) {
            otd = otd[0];
        }
    }
    return otd;
}

function pageId(title) {
    if (title) {
        return 'article-' + title.replace(' ', '_')
          .replace(':', '_').replace('(', '_').replace(')', '_');
    } else {
        return '';
    }
}

function load(lang, variant, title, callback) {
    var http = require('http'),
        host = lang + '.wikipedia.org',
        path = '/w/api.php?page=' + encodeURIComponent(title) + '&props=text&action=parse&variant=' + variant + '&format=json';

    var wp = http.createClient(80, host);
    var request = wp.request('GET', path,
        {
            'host': host,
            'User-Agent': 'WikipediaDisilled'
        }
    );
    sys.puts("request on:" + title);
    request.end();

    request.on('response', function (response) {
        response.setEncoding('utf-8');
        var body = "";
        response.on('data', function (chunk) {
            chunk = chunk.toString('utf8');
            body = body + chunk;
        });
        response.on('end', function () {
            try {
                var data = JSON.parse(body);
                if (callback) {
                    callback(title, data.parse);
                }
                body = '';
            } catch (e) {
                sys.puts("error:" + e);
                sys.puts("line:" + e.stack.toString());
                body = '';
            }
        });
    });
}

function loadPage(lang, variant, title, callback) {
    load(lang, variant, title, function (title, data) {
        var id = pageId(redirectMap[title]);
        var html = '<div id="' + id + '" class="pages">' + data.text['*'] +'</div>';
        window.$('#articles').append(window.$(html));
        sys.puts('append ' + title + ':' + id);
        if(callback) {
            callback(title, data);
        }
    });
}

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

function save(ext, content) {
    var date = new Date(),
        year = date.getUTCFullYear(),
        month = date.getUTCMonth() + 1,
        day = date.getUTCDate();
    var file = process.cwd() + '/public/issues/' + year + '/' + month + '/' + day + '.' + ext;
    if (!path.exists(file)) {
        require('sys').puts('create directory to:' + path.dirname(file));
        mkdir(path.dirname(file));
    }
    sys.puts('saving dump to:' + file);
    fs.writeFileSync(file, content);
}

function saveCss(css) {
    save('css', css);
}

function saveJson(json) {
    save('json', json);
}

function saveHtml(html) {
    save('html', html);
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

function solveRedirect(lang, variant, title, callback) {
    var http = require('http'),
        host = lang + '.wikipedia.org',
        path = '/w/api.php?titles=' + encodeURIComponent(titleMap[title]) + '&redirects&action=query&format=json';

    var wikipedia = http.createClient(80, host);
    var request = wikipedia.request('GET', path,
        {
            'host': host,
            'User-Agent': 'WikipediaDisilled'
        }
    );
    request.end();

    request.on('response', function (response) {
        response.setEncoding('utf-8');
        var body = "";
        response.on('data', function (chunk) {
            chunk = chunk.toString('utf8');
            body = body + chunk;
        });
        response.on('end', function () {
            try {
                var data = JSON.parse(body);
                if (callback) {
                    var to = title;
                    if (data.query.redirects) {
                        to = data.query.redirects[0].to;
                    } else {
                        to = titleMap[title];
                    }
                    sys.puts('redirect from:' + title + ' to ' + to);
                    redirectMap[to] = title;
                    callback(to);
                }
                body = '';
            } catch (e) {
                body = '';
            }
        });
    });
}

function throttledLoad() {
    var ind = 0, handle;
    function loading() {
        var len = articles.length;
        if (ind < len) {
            solveRedirect(config.lang, config.wiki, articles[ind], function (title) {
                loadPage(config.lang, config.variant, title, fixArticle);
            });
            ind++;
        } else {
            clearInterval(handle);
        }
    }
    handle = setInterval(loading, 15000);
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

loadMain(throttledLoad);

