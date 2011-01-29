function editor() {

    var rtag = /\w+/, rpos = /\d+/;
    var cur = null;
    var grid = {rows: 30, columns: 30};
    var gwidth = Math.round($('div#leftview').width() / grid.columns);

    function path(elem) {
        if(!elem) {
            return '';
        } else {
            var seq = $(elem).parentsUntil('.content').andSelf();
            return seq.map(function() {
                var self = $(this);
                var tagName = this.nodeName.toLowerCase();
                if (self.siblings(tagName).length > 0) {
                    var len = self.prevAll(tagName).length;
                    tagName += '[' + len + ']';
                }
                return tagName;
            }).get().join('/');
        }
    }

    function at(root, p) {
        return _.reduce(p.split('/'), function (memo, seg) {
            if (!memo) {
                return undefined;
            } else {
                var tag = rtag.exec(seg),
                    pos = rpos.exec(seg);
                tag = tag?tag[0]:undefined;
                pos = pos?parseInt(pos[0]):undefined;
                var children = tag?memo.children(tag):undefined;
                var child = pos?
                          (children?children.eq(pos):undefined):
                          (children?children.eq(0):undefined);
                return child;
            }
        }, root);
    }

    function bothcur() {
        return $([at($('#leftcontent'), path(cur)).get(0),
                  at($('#rightcontent'), path(cur)).get(0)]);
    }

    function leftcur() {
        return at($('#leftcontent'), path(cur));
    }

    function rightcur() {
        return at($('#rightcontent'), path(cur));
    }

    function highlight() {
        if (cur && cur.hasClass('highlighted')) {
            bothcur().removeClass('highlighted');
        }
        cur = $(this);
        bothcur().addClass('highlighted');
    }

    function thumb(src, width) {
        if (!src) {
            return '';
        } else {
            return 'http://commons.wikimedia.org/w/thumb.php?f=' + src.replace(' ', '_') + '&w=' + width;
        }
    }

    $('.pages > h2').click(highlight);
    $('.pages > h3').click(highlight);
    $('.pages > h4').click(highlight);
    $('.pages > h5').click(highlight);
    $('.pages > h6').click(highlight);
    $('.pages > p').click(highlight);
    $('.pages > div').click(highlight);
    $('.pages > table').click(highlight);
    $('.pages > ul').click(highlight);
    $('.pages > ol').click(highlight);
    $('.pages > dl').click(highlight);
    $('.pages div.thumb').click(highlight);

    $('.tool').hover(function () {
        $(this).addClass("toolhover");
    },
    function () {
        $(this).removeClass("toolhover");
    });
    $('.tool_cr').click(function () {
        if (cur) {
            bothcur().append($('<br/>'));
        }
    });
    $('.tool_del').click(function () {
        if (cur) {
            bothcur().remove();
            cur = null;
        }
    });
    $('.tool_left').click(function () {
        if (cur) {
            var both = bothcur();
            if (cur.hasClass('center')) {
                both.removeClass('center');
            }
            if (cur.hasClass('right')) {
                both.removeClass('right');
            }
            both.addClass('left');
        }
    });
    $('.tool_center').click(function () {
        if (cur) {
            var both = bothcur();
            if (cur.hasClass('left')) {
                both.removeClass('left');
            }
            if (cur.hasClass('right')) {
                both.removeClass('right');
            }
            both.addClass('center');
        }
    });
    $('.tool_right').click(function () {
        if (cur) {
            var both = bothcur();
            if (cur.hasClass('center')) {
                both.removeClass('center');
            }
            if (cur.hasClass('left')) {
                both.removeClass('left');
            }
            both.addClass('right');
        }
    });
    $('.tool_prev').click(function () {
        if (cur) {
            leftcur().prev().before(leftcur().detach());
            rightcur().prev().before(rightcur().detach());
        }
    });
    $('.tool_next').click(function () {
        if (cur) {
            leftcur().next().after(leftcur().detach());
            rightcur().next().after(rightcur().detach());
        }
    });
    $('.tool_shrink').click(function () {
        if (cur) {
            var both = bothcur();
            if (cur.hasClass('thumb')) {
                var imgs  = both.find('img'),
                    img   = $(imgs[0]),
                    width = Math.round(img.width() - gwidth),
                    gwid  = Math.round(width/gwidth),
                    name  = img.attr('data');
                imgs.width(width);
                imgs.removeAttr('height');
                imgs.attr(gwid, gwid);
                both.find('.thumbinner').css('width', (width + 10) + 'px');
            }
        }
    });
    $('.tool_expand').click(function () {
        if (cur) {
            var both = bothcur();
            if (cur.hasClass('thumb')) {
                var imgs  = both.find('img'),
                    img   = $(imgs[0]),
                    width = Math.round(img.width() + gwidth),
                    gwid  = Math.round(width/gwidth),
                    name  = img.attr('data');
                imgs.width(width);
                imgs.attr(gwid, gwid);
                imgs.removeAttr('height');
                imgs.attr('src', thumb(name, width));
                both.find('.thumbinner').css('width', (width + 10) + 'px');
            }
        }
    });

    $('.tool_save').click(function () {
        var temp = $('#contents').html($('#leftcontent').html()),
            imgs = temp.find('img');
        imgs.attr('src', '');
        imgs.removeAttr('width');
        imgs.removeAttr('height');
        temp.find('#tocpage li').each(function (ind, li) {
           li = $(li);
           li.html(li.html().split('\t')[0]);
        });
        temp.find('.highlighted').removeClass('highlighted');
        $.ajax({
           type: "PUT",
           url: "",
           data: {html: temp.html()},
           success: function(msg){
             alert("已经保存！");
           }
        });
    });

}
