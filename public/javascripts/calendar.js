function calendar(date) {
    date = date || new Date();

    function thumb(src, width) {
        return 'http://commons.wikimedia.org/w/thumb.php?f=' + src.replace(' ', '_') + '&w=' + Math.round(width);
    }

    var width = $('#doublepage').width() / 7 * 0.4;
    var height = $('#doublepage').height() / 7 * 0.8;

    var html = _.template(
        '<div id="cover-<%= title %>" title="<%= title %>" ' +
          'style="background:<%= bg %>;width:40%;height:80%;" ' +
          'class="cover-thumb cover-thumb-<%= cover %>">' +
        '<div class="cover-thumb-u">维基日刊</div>' +
        '<div class="cover-thumb-v">维<br/>基<br/>日<br/>刊</div>' +
        '<div class="cover-thumb-w">' +
        '<img src="<%= thumb(photo, ' + width + ') %>">' +
        '</div>' +
        '</div>'
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
                thumb: thumb
            };

            cell.html(html(ctx));
        });

        $('.cover-thumb').each(function (ind, cover) {
            cover = $(cover);
            cover.click(function (e) {
                var url = '/issues/' + cover.attr('title');
                window.location.assign(url);
            });
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
