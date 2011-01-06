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
    grid: {rows: 30, columns: 30}
};

var daily = (function wikidaily(config) {

    var mode= 'double' || 'signle';

    var index = {}, articles = [], curDate;

    function thumb(src, width) {
        return 'http://commons.wikimedia.org/w/thumb.php?f=' + src.replace(' ', '_') + '&w=' + width;
    }

    function fixImage() {
        var pagewidth = $('div#leftview').width();
        $('div.pages img').each(function (i, img) {
            var filename = $(img).attr('data');
            var width = $(img).attr('width');
            if (filename) {
                width = width || Math.round(0.2 * pagewidth);
                if (width > Math.round(0.2 * pagewidth)) {
                    width = Math.round(0.2 * pagewidth);
                }
                $(img).attr('src', thumb(filename, width));
            }
        });
        //$('div.thumb').each(function (i, thumb) {
        //    $(thumb).addClass('left');
        //});
    }

    function gridify() {
        var rows = config.rows, columns = config.columns;
        var theight = $('#leftview').height(), twidth = $('#leftview').width();
        var gheight = Math.floor(theight/rows), gwidth = Math.floor(twidth/columns);

        _(['contentleft', 'contentright']).each(function(id) {
            $('#' + id + ' > div img').each(function (i, img) {
                var t = $(img).position().top;
                $(img).position({top: Math.ceil(t/gheight)*gheight});
                var h = $(img).height(), w = $(img).width();
                $(img).width(Math.ceil(w/gwidth)*gwidth + 'px');
                $(img).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div h1').each(function (i, head) {
                var t = $(head).position().top;
                $(head).position({top: Math.ceil(h/gheight)*gheight});
            });
            $('#' + id + ' > div h2').each(function (i, head) {
                var t = $(head).position().top;
                $(head).position({top: Math.ceil(h/gheight)*gheight});
            });
            $('#' + id + ' > div h3').each(function (i, head) {
                var t = $(head).position().top;
                $(head).position({top: Math.ceil(h/gheight)*gheight});
            });
            $('#' + id + ' > div h4').each(function (i, head) {
                var t = $(head).position().top;
                $(head).position({top: Math.ceil(h/gheight)*gheight});
            });
            $('#' + id + ' > div h5').each(function (i, head) {
                var t = $(head).position().top;
                $(head).position({top: Math.ceil(h/gheight)*gheight});
            });
            $('#' + id + ' > div h6').each(function (i, head) {
                var t = $(head).position().top;
                $(head).position({top: Math.ceil(h/gheight)*gheight});
            });
            $('#' + id + ' > div dl').each(function (i, dl) {
                var t = $(dl).position().top;
                $(dl).position({top: Math.ceil(h/gheight)*gheight});
            });
            $('#' + id + ' > div > div').each(function (i, d) {
                var t = $(d).position().top;
                var l = $(d).position().left;
                $(d).position({
                    top: Math.ceil(t/gheight)*gheight,
                    left: Math.ceil(l/gwidth)*gwidth
                });
                var h = $(d).height(), w = $(d).width();
                $(d).width(Math.ceil(w/gwidth)*gwidth + 'px');
                $(d).height(Math.ceil(h/gheight)*gheight + 'px');
            });
            $('#' + id + ' > div table').each(function(i, t) {
                var h = $(t).position().top;
                var l = $(t).position().left;
                $(t).position({
                    top: Math.ceil(h/gheight)*gheight,
                    left: Math.ceil(l/gwidth)*gwidth
                });
            });
            $('#' + id + ' > div table > tr').each(function(i, r) {
                var h = $(r).height(), w = $(r).width();
                $(r).width(Math.ceil(w/gwidth)*gwidth + 'px');
                $(r).top(Math.ceil(h/gtop)*gtop + 'px');
            });
            $('#' + id + ' > div table > tr > td').each(function(i, d) {
                var h = $(d).height(), w = $(d).width();
                $(d).width(Math.ceil(w/gwidth)*gwidth + 'px');
                $(d).top(Math.ceil(h/gtop)*gtop + 'px');
            });
            $('#' + id + ' > div p').each(function(i, p) {
                var t = $(p).position().top;
                var l = $(p).position().left;
                $(p).position({
                    top: Math.ceil(h/gheight)*gheight,
                    left: Math.ceil(l/gwidth)*gwidth
                });
            });
            $('#' + id + ' > div ul').each(function(i, u) {
                var t = $(u).position().top;
                var l = $(u).position().left;
                $(u).position({
                    top: Math.ceil(h/gheight)*gheight,
                    left: Math.ceil(l/gwidth)*gwidth
                });
            });
            $('#' + id + ' > div ol').each(function(i, o) {
                var t = $(o).position().top;
                var l = $(o).position().left;
                $(o).position({
                    top: Math.ceil(h/gheight)*gheight,
                    left: Math.ceil(l/gwidth)*gwidth
                });
            });
            $('#' + id + ' > div ul > li').each(function(i, l) {
                var h = $(l).css('line-top');
                $(l).css('line-top', Math.ceil(h/gwidth)*gwidth + 'px');
            });
            $('#' + id + ' > div ol > li').each(function(i, l) {
                var h = $(l).css('line-top');
                $(l).css('line-top', Math.ceil(h/gwidth)*gwidth + 'px');
            });
        });
    }

    function pagify() {
        var height = $('#leftview').height();
        $('.pages').each(function (i, d) {
            var h = $(d).height();
            $(d).height(Math.ceil(h/height) * height);
        });

        toc();
    }

    function cover() {
        var photo = $('.cover-w img');
        photo.attr('src', thumb(photo.attr('data'), $('#leftview').width()));
    }

    function toc() {
        var pageHeight = $('#rightview').height();
        var top = $('#rightview').offset().top;
        $.ajax({
          url: '/issues/' + curDate + '.json',
          success: function(data) {
              var articles = data.articles, pageNum = 0;
              if(articles) {
                  _(articles).each(function (article) {
                      var id = pageId(article);
                      article = $('#' + id);
                      if(article.length>0) {
                          var pageNum = Math.round((article.offset().top - top)/pageHeight) - 1,
                              li = $('li#toc-' + id);
                              li.html(
                                li.html() + '\t......\t' +
                                '<a href="javascript:daily.go(' +
                                  pageNum +
                                ');">' + pageNum + '</a>');
                      }
                  });
              }
          }
        });
    }

    function toPage(cmp, pageNum) {
        var height = pageNum*$('#rightview').height();
        var top = $('#rightview').offset().top;
        cmp.offset({top: top-height});
    }

    var curLeftPage = 0;
    var pageNumber = 0;
    function previousPage() {
        if(curLeftPage>=2) {
            curLeftPage = curLeftPage - 2;
            toPage($('#leftcontent'), curLeftPage);
            toPage($('#rightcontent'), curLeftPage+1);
        }
    }
    function nextPage() {
        if(pageNumber===0) {
            pageNumber = $('#leftcontent').height()/$('#rightview').height();
        }
        if(curLeftPage<pageNumber && (curLeftPage+1)<pageNumber) {
            curLeftPage = curLeftPage + 2;
            toPage($('#leftcontent'), curLeftPage);
            toPage($('#rightcontent'), curLeftPage+1);
        }
    }
    function tocPage() {
        if(pageNumber===0) {
            pageNumber = $('#leftcontent').height()/$('#rightview').height();
        }
        if(curLeftPage<pageNumber && (curLeftPage+1)<pageNumber) {
            curLeftPage = 0;
            toPage($('#leftcontent'), curLeftPage);
            toPage($('#rightcontent'), curLeftPage+1);
        }
    }

    function pageId(title) {
        if (title) {
            return 'article-' + title.replace(/[ :\(\)·]/g, '_');
        } else {
            return '';
        }
    }

    function loadIssue(date) {
        curDate = date;
        $.ajax({
          url: '/issues/' + date + '.html',
          success: function(data) {
              $('#leftcontent').html(data);
              $('#rightcontent').html(data);
              toPage($('#leftcontent'), 0);
              toPage($('#rightcontent'),1);
              cover();
              fixImage();
              $('#go_prev').click(previousPage);
              $('#go_next').click(nextPage);
              $('#go_toc_left').click(tocPage);
              $('#go_toc_right').click(tocPage);
              var imgs = $('img'), len = imgs.length, ind = 0;
              imgs.load(function(e) {ind++; if(len === ind) gridify();});
              gridify();
              pagify();
          }
        });
    }

    return {
        load: loadIssue,
        go: function (page) {
            curLeftPage = 2 * Math.floor((page + 1) / 2);
            toPage($('#leftcontent'), curLeftPage);
            toPage($('#rightcontent'), curLeftPage + 1);
        }
    };

})(defaultConfig);
