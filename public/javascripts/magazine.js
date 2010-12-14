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

    var index = {}, articles = [];

    function gridify() {
        var rows = config.rows, columns = config.columns;
        var theight = $('#leftview').height(), twidth = $('#leftview').width();
        var gheight = Math.round(theight/rows), gwidth = Math.round(twidth/columns);

        _(['contentleft', 'contentright']).each(function(id) {
            $('#' + id + ' > div img').each(function (i, img) {
                var t = $(img).position().top;
                $(img).position({top: Math.ceil(t/gheight)*gheight});
                var h = $(img).height(), w = $(img).width();
                $(img).width(Math.ceil(w/gwidth)*gwidth + 'px');
                $(img).top(Math.ceil(h/gtop)*gtop + 'px');
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
            $('#' + id + ' > div > div').each(function (i, d) {
                var t = $(d).position().top;
                var l = $(d).position().left;
                $(d).position({
                    top: Math.ceil(t/gheight)*gheight,
                    left: Math.ceil(l/gwidth)*gwidth
                });
                var h = $(d).height(), w = $(d).width();
                $(d).width(Math.ceil(w/gwidth)*gwidth + 'px');
                $(d).top(Math.ceil(h/gtop)*gtop + 'px');
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
    }

    function padding() {
    }

    function toc() {
    }

    function show() {
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
            toPage($('#contentleft'), curLeftPage);
            toPage($('#contentright'), curLeftPage+1);
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

    function pageId(title) {
        return 'article-' + title.replace(' ', '_').replace(':', '_');
    }

    return {
        show: function() {
            var url = '/issues/current.json';
            $.getJSON(url, function (data) {
                $.ajax({
                  url: data.path,
                  success: function(data) {
                      $('#leftcontent').html(data);
                      $('#rightcontent').html(data);
                      toPage($('#leftcontent'), 0);
                      toPage($('#rightcontent'),1);
                      $('#leftcontent').click(previousPage);
                      $('#rightcontent').click(nextPage);
                      $('img').load(function(e) {gridify();});
                      gridify();
                      pagify();
                  }
                });
            });
        }
    };

})(defaultConfig);
