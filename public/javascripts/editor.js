function editor() {

    var cur = null;

    function highlight() {
        var self = $(this);
        if(cur === self) {
            if (cur.css('border')) {
                cur.css('border', null);
                cur = null;
            } else {
                cur.css('border', '1px solid black');
            }
        } else {
            if (cur && cur.css('border')) {
                cur.css('border', null);
            }
            cur = self;
            cur.css('border', '1px solid black');
        }
    }

    $('.pages > p').click(highlight);
    $('.pages > div').click(highlight);
}
