function editor() {

    function highlight() {
        $(this).css('border', '1px solid black');
    }

    $('.pages > p').toggle(highlight);
    $('.pages > div').toggle(highlight);
}
