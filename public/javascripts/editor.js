function editor() {

    var rtag = /\w+/, rpos = /\d+/;
    var cur = null;

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
                    tagName += '[' + (len + 1) + ']';
                }
                return tagName;
            }).get().join('/');
        }
    }

    function at(root, path) {
        return _.reduce(path.split('/'), function (memo, seg) {
            if (!root) {
                return undefined;
            } else {
                var tag = rtag.exec(seg),
                    pos = rpos.exec(seg);
                tag = tag?tag[0]:undefined;
                pos = pos?pos[0]:undefined;
                var children = tag?root.find(tag):undefined;
                console.log(tag + '[' + pos + ']');
                return pos?
                          (children?children.eq(pos - 1):undefined):
                          (children?children:undefined);
            }
        }, root);
    }

    function highlight() {
        if (cur && cur.hasClass('highlighted')) {
            cur.removeClass('highlighted');
        }
        cur = $(this);
        cur.addClass('highlighted');
        console.log(path(cur));
        console.log(path(at($('#leftcontent'), path(cur))));
        console.log(path(at($('#rightcontent'), path(cur))));
    }

    $('.pages > p').click(highlight);
    $('.pages > div').click(highlight);
    $('.pages > table').click(highlight);
    $('.pages > ul').click(highlight);
    $('.pages > ol').click(highlight);

    $('.tool').hover(function () {
        $(this).addClass("toolhover");
    },
    function () {
        $(this).removeClass("toolhover");
    });
    $('.tool_cr').click(function () {
        if (cur) {
            cur.append($('<br/>'));
        }
    });
    $('.tool_del').click(function () {
        if (cur) {
            cur.remove();
            cur = null;
        }
    });
    $('.tool_left').click(function () {
        if (cur) {
            if (cur.hasClass('center')) {
                cur.removeClass('center');
            }
            if (cur.hasClass('right')) {
                cur.removeClass('right');
            }
            cur.addClass('left');
        }
    });
    $('.tool_center').click(function () {
        if (cur) {
            if (cur.hasClass('left')) {
                cur.removeClass('left');
            }
            if (cur.hasClass('right')) {
                cur.removeClass('right');
            }
            cur.addClass('center');
        }
    });
    $('.tool_right').click(function () {
        if (cur) {
            if (cur.hasClass('center')) {
                cur.removeClass('center');
            }
            if (cur.hasClass('left')) {
                cur.removeClass('left');
            }
            cur.addClass('right');
        }
    });
    $('.tool_prev').click(function () {
        if (cur) {
            cur.prev().before(cur.detach());
        }
    });
    $('.tool_next').click(function () {
        if (cur) {
            cur.next().after(cur.detach());
        }
    });

}
