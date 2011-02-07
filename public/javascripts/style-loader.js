(function () {
    var link   = document.createElement('link');
    var head  = document.getElementsByTagName('head')[0];
    var title  = document.getElementsByTagName('title')[0];
    link.type  = 'text/css';
    link.rel   = 'stylesheet';
    link.media = 'screen';
    head.insertBefore(link, title);
    link.onerror = function () {
        this.href = '/styles/magazine.css?width=1024&height=768';
    };
    link.href  = '/styles/magazine.css?width=' + screen.availWidth + '&height=' + screen.availHeight;
})();



