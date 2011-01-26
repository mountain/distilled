function editor() {

    var cur = null;

    function highlight() {
        if (cur && cur.hasClass('highlighted')) {
            cur.removeClass('highlighted');
        }
        cur = $(this);
        cur.addClass('highlighted');
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
