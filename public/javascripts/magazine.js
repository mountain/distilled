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
        show: function() {
            var url = '/issues/current.json';
            $.getJSON(url, function (data) {
                $.ajax({
                  url: data.path,
                  success: function(data) {
                      $('#leftcontent').html(data);
                      $('#rightcontent').html(data);
                  }
                });
                toPage($('#leftcontent'), 0);
                toPage($('#rightcontent'),1);
                $('#leftcontent').click(previousPage);
                $('#rightcontent').click(nextPage);
            });
        }
    };

})(defaultConfig);
