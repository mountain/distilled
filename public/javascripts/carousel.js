function carousel() {
    function small(src, width) {
        return 'http://commons.wikimedia.org/w/thumb.php?f=' + src.replace(' ', '_') + '&w=' + Math.round(width - 2);
    }

    var width = Math.round($('#daily-detail').width() / 5 * 0.8);
    var height = Math.round(width * 1.236);

    var html = _.template(
        '<div id="cover-<%= title %>" title="<%= title %>" ' +
          'style="background:<%= bg %>;width:<%= width %>px;height:<%= height %>px;" ' +
          'class="cover-small cover-small-<%= cover %> ' +
          '<% if (cover) { %>clickable<% } %>"' +
        '>' +
        '<div class="cover-small-u">维基日刊</div>' +
        '<div class="cover-small-v">维<br/>基<br/>日<br/>刊</div>' +
        '<div class="cover-small-w">' +
        '<table><tr><td><div><img src="<%= small(photo, ' + width + ') %>"></div></td></tr></table>' +
        '</div>' +
        '</div>' +
        '<div class="date"><%= month %>月<%= day %>日</div>'
    );

    function showMagazines(car) {
        car.find('.mag').each(function(ind, cell) {
            cell = $(cell);
            var ctx = {
                cover: cell.attr('cover'),
                photo: cell.attr('photo'),
                title: cell.attr('title'),
                bg: cell.attr('bg'),
                small: small,
                month: cell.attr('title').split('/')[1],
                day: cell.attr('title').split('/')[2],
                width: width,
                height: height
            };

            cell.html(html(ctx)).css('height', Math.round(height * 1.2))
                                .css('width', Math.round(width * 1.2));
        });

        $('.cover-small').each(function (ind, cover) {
            cover = $(cover);
            if (!cover.hasClass('cover-small-')) {
                cover.click(function (e) {
                    var url = '/issues/' + cover.attr('title');
                    window.location.assign(url);
                });
            }
        });
    }

    $.ajax({
      url: '/issues/latest.html',
      success: function(data) {
          var detail = $('#daily-detail');
          detail.html(data);
          showMagazines(detail);
          detail.jCarouselLite({
              visible: 5,
              btnPrev: '.previous',
              btnNext: '.next'
          });
      }
    });
}
