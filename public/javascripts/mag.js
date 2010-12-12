var defaultConfig = {
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

var daily = (function wikidaily(config) {

    var mode= 'double' || 'signle';

    var index = {}, articles = [];

    var count = 0, taskNum = 0;

    function initialize() {
        var url = 'http://' + config.lang + '.wikiedge.org/daily/config/2010-12-10?format=json&callback=?';
        $.getJSON(url, function(data) {
            _.extend(config, data);
        });
    }

    var feature, featurepic, good, itn, dyk, otd;
    function getfeature () {
        if(!feature) {
            feature = $('#column-feature b > a').attr('title');
        }
        return feature;
    }
    function getfeaturepic() {
        if(!featurepic) {
            featurepic = $('#column-featurepic b > a').attr('title');
        }
        return featurepic;
    }
    function getgood() {
        if(!good) {
            good = $('#column-good b > a').attr('title');
        }
        return good;
    }
    function getitn() {
        if(!itn) {
            itn =  _($('#column-itn b > a')).map(function(a) {
                return $(a).attr('title');
            });
        }
        return itn;
    }
    function getdyk() {
        if(!dyk) {
            dyk =  _($('#column-dyk b > a')).map(function(a) {
                return $(a).attr('title');
            });
        }
        return dyk;
    }
    function getotd() {
        if(!otd) {
            otd =  _($('#column-otd b > a')).map(function(a) {
                return $(a).attr('title');
            });
            if(otd) {
                otd = otd[0];
            }
        }
        return otd;
    }

    function loadMain(callback) {
        load(config.lang,  config.wiki, config.mainpage, function(title, data) {
            $('#mainpage').append($(data.text['*']));

            index.feature = config.feature || getfeature();
            index.good = config.good || getgood();
            index.featurepic = config.featurepic || getfeaturepic();
            index.dyk = config.dyk || getdyk();
            index.itn = config.itn || getitn();
            index.otd = config.otd || getotd();

            articles = _(index).chain().values().flatten().uniq().value();
            tasknum = articles.length - 1;

            cover();

            if(callback) {
                callback(title, data);
            }
        });
    }

    function loadPage(lang, variant, title, callback) {
        load(lang, variant, title, function(title, data) {
            var html = '<div id="' + pageId(title) + '">' + data.text['*'] +'</div>';
            $('#articles').append($(html));
            if(callback) {
                callback(title, data);
            }
        });
    }

    function load(lang, variant, title, callback) {
        var url = 'http://' + lang + '.wikipedia.org/w/api.php?page=' + title +
          '&props=text&action=parse&variant=' + variant + '&format=json&callback=?';

        $.getJSON(url, function(data) {
            if(callback) {
                callback(title, data.parse);
            }
        });
    }

    function fixArticle(title, data) {
        var id = pageId(title);
        $('#' + id + ' .toc').remove();
        $('#' + id + ' .editsection').remove();
        $('#' + id + ' .metadata').remove();
        $('#' + id + ' .navbox').remove();
        $('#' + id + ' .infobox').remove();
        $('#' + id + ' .topicon').remove();
        $('#' + id + ' table:first-child[class="wikitable"]').remove();

        $('#' + id + ' .thumb').removeClass('tright').removeClass('tleft');

        $('#' + id + ' p').after($('<div class="vspace"></div>'));
        $('#' + id ).append($('<div class="seperator"></div>'));

        count++;
        $('#progress').width($('#indicator').width()*count/tasknum);
        if(count===tasknum) {
            $('#indicator').hide();
            contents();
            gridify();
            padding();
            toc();
            show();
        }
    }

    function solveRedirect(lang, variant, title, callback) {
        var url = 'http://' + lang + '.wikipedia.org/w/api.php?titles=' + title +
          '&redirects&variant=' + variant + '&action=query&format=json&callback=?';

        $.getJSON(url, function(data) {
            if(callback) {
                if(data.query.redirects) {
                    title = data.query.redirects[0].to
                }
                callback(title);
            }
        });
    }

    function throttledLoad() {
        function loading() {
            var len = articles.length;
            if(ind<len) {
                if(articles[ind]!='劉曉波')
                solveRedirect(config.lang, config.wiki, articles[ind], function(title) {
                    loadPage(config.lang, config.variant, title, fixArticle);
                });
                ind++;
            } else {
                clearInterval(handle);
            }
        }
        var ind = 0, handle = setInterval(loading, 3000);
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
        var src = $('#column-good div > a > img').attr('src');
        $('#cover-photo').html('<img src="' + originurl(src) + '"/>');

        $('#cover-top ul').append($('<li>' + index.feature + '</li>'));
        $('#cover-top ul').append($('<li>' + index.good + '</li>'));
        $('#cover-top ul').append($('<li>' + index.featurepic + '</li>'));

        _(index.itn).each(function(n) {
            $('#cover-right ul').append($('<li>' + n + '</li>'));
        });

        _(index.dyk).each(function(k) {
            $('#cover-left ul').append($('<li>' + k + '</li>'));
        });

        $('#viewleft').css({'z-index': 100});
        $('#viewright').css({'z-index': 100});
        $('#cover').css({'z-index': 100});
        $('#tocpage').css({'z-index': 100});
    }

    function contents() {
        var toc = config.toc;
        _(toc).chain().map(function(item) {
                return index[item];
        }).flatten().unique().map(function(title) {
            return pageId(title);
        }).each(function(id) {
            $('#contents').append($('<h1>' + id.substring(8).replace('_', ' ') + '</h1>'));
            $('#contents').append($('#' + id));
        });
        $('#contentleft').html($('#contents').html());
        $('#contentright').html($('#contents').html());
        $('#contents').remove();
    }

    function gridify() {
        var rows = config.rows, columns = config.columns;
        var theight = $('#leftview').height(), twidth = $('#leftview').width();
        var gheight = Math.round(theight/rows), gwidth = Math.round(twidth/columns);

        _(['contentleft', 'contentright']).each(function(id) {
            $('#' + id + ' > div span').css('line-height', gheight + 'px');
            $('#' + id + ' > div p').css('line-height', gheight + 'px');
            $('#' + id + ' > div p').css('font-size', gwidth + 'px');
            $('#' + id + ' > div h1').each(function (i, head) {
                var h = $(head).height();
                $(head).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div h2').each(function (i, head) {
                var h = $(head).height();
                $(head).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div h3').each(function (i, head) {
                var h = $(head).height();
                $(head).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div h4').each(function (i, head) {
                var h = $(head).height();
                $(head).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div h5').each(function (i, head) {
                var h = $(head).height();
                $(head).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div h6').each(function (i, head) {
                var h = $(head).height();
                $(head).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div > div').each(function (i, d) {
                var h = $(d).height(), w = $(d).width();
                $(d).width(Math.ceil(w/gwidth)*gwidth + 'px');
                $(d).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div table').each(function(i, t) {
                var h = $(t).height(), w = $(t).width();
                $(t).width(Math.ceil(w/gwidth)*gwidth + 'px');
                $(t).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div table > tr').each(function(i, r) {
                var h = $(r).height(), w = $(r).width();
                $(r).width(Math.ceil(w/gwidth)*gwidth + 'px');
                $(r).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div table > tr > td').each(function(i, d) {
                var h = $(d).height(), w = $(d).width();
                $(d).width(Math.ceil(w/gwidth)*gwidth + 'px');
                $(d).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div ul').each(function(i, u) {
                var p = $(u).css('padding'), m = $(u).css('margin');
                $(u).css({padding: Math.ceil(p/gwidth)*gwidth + 'px'});
                $(u).css({margin: Math.ceil(m/gheight)*gheight + 'px'});
            });
            $('#' + id + ' > div ol').each(function(i, o) {
                var p = $(o).css('padding'), m = $(o).css('margin');
                $(o).css({padding: Math.ceil(p/gwidth)*gwidth + 'px'});
                $(o).css({margin: Math.ceil(m/gheight)*gheight + 'px'});
            });
            $('#' + id + ' > div ul > li').each(function(i, l) {
                var h = $(l).css('line-height');
                $(l).css('line-height', Math.ceil(h/gwidth)*gwidth + 'px');
            });
            $('#' + id + ' > div ol > li').each(function(i, l) {
                var h = $(l).css('line-height');
                $(l).css('line-height', Math.ceil(h/gwidth)*gwidth + 'px');
            });
        });
    }

    function padding() {
    }

    function toc() {
    }

    function show() {
        $('#cover').css({'z-index': 100});
        $('#tocpage').css({'z-index': 100});
        toPage($('#contentleft'), 0);
        toPage($('#contentright'),1);
        $('#contentleft').click(previousPage);
        $('#contentright').click(nextPage);
        $('#tocpage').click(nextPage);
    }

    function toPage(cmp, pageNum) {
        var height = pageNum*$('#rightview').height();
        var top = $('#rightview').offset().top;
        cmp.offset({top: top-height});
    }

    var curLeftPage = -2;
    var pageNumber = 0;
    function previousPage() {
        if(curLeftPage>=2) {
            curLeftPage = curLeftPage - 2;
            toPage($('#contentleft'), curLeftPage);
            toPage($('#contentright'), curLeftPage+1);
        } else {
            $('#cover').css({'z-index': 100});
            $('#tocpage').css({'z-index': 100});
            $('#leftview').css({'z-index': 90});
            $('#rightview').css({'z-index': 90});
            $('#contentleft').css({'z-index': 90});
            $('#contentright').css({'z-index': 90});
            curLeftPage = -2;
        }
    }
    function nextPage() {
        if(pageNumber===0) {
            pageNumber = $('#contentleft').height()/$('#rightview').height();
        }
        if(curLeftPage<pageNumber && (curLeftPage+1)<pageNumber) {
            $('#cover').css({'z-index': 90});
            $('#tocpage').css({'z-index': 90});
            $('#leftview').css({'z-index': 100});
            $('#rightview').css({'z-index': 100});
            $('#contentleft').css({'z-index': 100});
            $('#contentright').css({'z-index': 100});
            curLeftPage = curLeftPage + 2;
            toPage($('#contentleft'), curLeftPage);
            toPage($('#contentright'), curLeftPage+1);
        }
    }

    function pageId(title) {
        return 'article-' + title.replace(' ', '_').replace(':', '_');
    }

    return {
        makeup: function() {
            initialize();
            loadMain(throttledLoad);
        }
    };

})(defaultConfig);
