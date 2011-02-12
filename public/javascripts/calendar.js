function calendar(date) {
    date = date || new Date();

    function thumb(src, width) {
        return 'http://commons.wikimedia.org/w/thumb.php?f=' + src.replace(' ', '_') + '&w=' + Math.round(width - 2);
    }

    var width = Math.round($('#calendar').width() / 7 * 0.4);
    var height = Math.round(width * 1.236);

    var html = _.template(
        '<div id="cover-<%= title %>" title="<%= title %>" ' +
          'style="background:<%= bg %>;width:<%= width %>px;height:<%= height %>px;" ' +
          'class="cover-thumb cover-thumb-<%= cover %> ' +
          '<% if (cover) { %>clickable<% } %>"' +
        '>' +
        '<div class="cover-thumb-u">维基日刊</div>' +
        '<div class="cover-thumb-v">维<br/>基<br/>日<br/>刊</div>' +
        '<div class="cover-thumb-w">' +
        '<table><tr><td><div><img src="<%= thumb(photo, ' + width + ') %>"></div></td></tr></table>' +
        '</div>' +
        '</div>' +
        '<% if (cover) { %><div class="date"><%= month %>月<%= day %>日</div><% } %>'
    );

    var yr = date.getUTCFullYear(),
        mon = date.getUTCMonth(),
        day = date.getUTCDate();

    function showMagazines() {
        $('.cal-cell').each(function(ind, cell) {
            cell = $(cell);
            var ctx = {
                cover: cell.attr('cover'),
                photo: cell.attr('photo'),
                title: cell.attr('title'),
                bg: cell.attr('bg'),
                thumb: thumb,
                month: cell.attr('title').split('/')[1],
                day: cell.attr('title').split('/')[2],
                width: width,
                height: height
            };

            cell.html(html(ctx));
        });

        $('.cover-thumb').each(function (ind, cover) {
            cover = $(cover);
            if (!cover.hasClass('cover-thumb-')) {
                cover.click(function (e) {
                    var url = '/issues/' + cover.attr('title');
                    window.location.assign(url);
                });
            }
        });
    }

    $.ajax({
      url: '/issues/' + yr + '/' + (mon + 1) + '/' + 'index.html',
      success: function(data) {
          $('#calendar').html(data);
          showMagazines();
      }
    });
}
