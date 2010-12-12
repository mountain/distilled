var _ = require('../lib/underscore');

var parser   = require('../vendors/htmlparser/lib/htmlparser'),
    jsdom    = require('../vendors/jsdom/lib/jsdom'),
    document = jsdom.jsdom(
      '<html><head></head><body>' +
      '<div id="mainpage"></div>' +
      '<div id="articles"></div>' +
      '<div id="contents">' +
      '<div id="cover" class="leftpage">' +
      '<div id="cover-photo"></div>' +
      '<div id="cover-title">维基日刊</div>' +
      '<div id="cover-top"><ul></ul></div>' +
      '<div id="cover-left"><ul></ul></div>' +
      '<div id="cover-right"><ul></ul></div>' +
      '</div>' +
      '<div id="tocpage" class="rightpage">' +
      '<div class="head-right">新闻</div>' +
      '<div class="toc-left"></div>' +
      '<div class="head-right">新知</div>' +
      '<div class="toc-left"></div>' +
      '<div class="head-right">特色</div>' +
      '<div class="toc-left"></div>' +
      '<div class="head-right">优良</div>' +
      '<div class="toc-left"></div>' +
      '<div class="head-right">图像</div>' +
      '<div class="toc-left"></div>' +
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
    back: {},
    grid: {rows: 30, columns: 20}
};

var index = {}, articles = [];

var count = 0, tasknum = 0;

var feature, featurepic, good, itn, dyk, otd;
function getfeature() {
    if (!feature) {
        feature = window.$('#column-feature b > a').attr('title');
    }
    return feature;
}
function getfeaturepic() {
    if (!featurepic) {
        featurepic = window.$('#column-featurepic b > a').attr('title');
    }
    return featurepic;
}
function getgood() {
    if (!good) {
        good = window.$('#column-good b > a').attr('title');
    }
    return good;
}
function getitn() {
    if (!itn) {
        itn =  _(window.$('#column-itn b > a')).map(function (a) {
            return window.$(a).attr('title');
        });
    }
    return itn;
}
function getdyk() {
    if (!dyk) {
        dyk =  _(window.$('#column-dyk b > a')).map(function (a) {
            return window.$(a).attr('title');
        });
    }
    return dyk;
}
function getotd() {
    if (!otd) {
        otd =  _(window.$('#column-otd b > a')).map(function (a) {
            return window.$(a).attr('title');
        });
        if (otd) {
            otd = otd[0];
        }
    }
    return otd;
}

function pageId(title) {
    return 'article-' + title.replace(' ', '_').replace(':', '_');
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
    require('sys').puts("request on:" + host + path);
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
                require('sys').puts("error:" + e);
                body = '';
            }
        });
    });
}

function loadPage(lang, variant, title, callback) {
    load(lang, variant, title, function (title, data) {
        var html = '<div id="' + pageId(title) + '">' + data.text['*'] +'</div>';
        window.$('#articles').append(window.$(html));
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
    var filepath = result[result.length - 1].split("/");
    filepath[1] = filepath[1].replace(/^\d+px-/, width + "px-");
    result[result.length - 1] = filepath.join("/");
    result.shift();
    return result.join('');
}

function originurl(src) {
    var result = uploadpattern.exec(src);
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

function contents() {
    var toc = config.toc;
    _(toc).chain().map(function (item) {
        return index[item];
    }).flatten().unique().map(function (title) {
        return pageId(title);
    }).each(function (id) {
        window.$('#contents').append(window.$('<h1>' + id.substring(8).replace('_', ' ') + '</h1>'));
        window.$('#contents').append(window.$('#' + id));
        require('sys').puts(window.$('#contents > div').length);
    });
}

function save(html) {
    require('sys').puts('saving dump...');
    var date = new Date(),
        year = date.getUTCFullYear(),
        month = date.getUTCMonth(),
        day = date.getUTCDate();
    require('fs').write(process.cwd() + '/public/issues/' + year + '/' + month + '/' + day + '.html', html, 0, html.length, 0);
}

function fixArticle(title, data) {
    var id = pageId(title);
    window.$('#' + id + ' .toc').remove();
    window.$('#' + id + ' .editsection').remove();
    window.$('#' + id + ' .metadata').remove();
    window.$('#' + id + ' .navbox').remove();
    window.$('#' + id + ' .infobox').remove();
    window.$('#' + id + ' .topicon').remove();
    window.$('#' + id + ' table:first-child[class="wikitable"]').remove();

    window.$('#' + id + ' .thumb').removeClass('tright').removeClass('tleft');

    window.$('#' + id + ' p').after(window.$('<div class="vspace"></div>'));
    window.$('#' + id).append(window.$('<div class="seperator"></div>'));

    count++;
    if (count === tasknum - 1) {
        contents();
        save(window.$('#contents').html());
    }
}

function solveRedirect(lang, variant, title, callback) {
    var http = require('http'),
        host = lang + '.wikipedia.org',
        path = '/w/api.php?titles=' + encodeURIComponent(title) + '&redirects&variant=' + variant + '&action=query&format=json';

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
                    if (data.query.redirects) {
                        title = data.query.redirects[0].to;
                    }
                    callback(title);
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
            if (articles[ind] !== '劉曉波') {
                solveRedirect(config.lang, config.wiki, articles[ind], function (title) {
                    loadPage(config.lang, config.variant, title, fixArticle);
                });
            }
            ind++;
        } else {
            clearInterval(handle);
        }
    }
    handle = setInterval(loading, 3000);
}

function loadMain(callback) {
    require('sys').puts("start loading main");
    load(config.lang, config.wiki, config.mainpage, function (title, data) {
        window.$('#mainpage').append(window.$(data.text['*']));

        index.feature = config.feature || getfeature();
        index.good = config.good || getgood();
        index.featurepic = config.featurepic || getfeaturepic();
        index.dyk = config.dyk || getdyk();
        index.itn = config.itn || getitn();
        index.otd = config.otd || getotd();

        articles = _(index).chain().values().flatten().uniq().value();
        tasknum = articles.length;

        cover();

        if (callback) {
            callback(title, data);
        }
    });
}

loadMain(throttledLoad);

