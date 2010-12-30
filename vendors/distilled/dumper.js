var _ = require('../../lib/underscore');

var path = require('path'),
    fs   = require('fs'),
    sys  = require('sys');

var logger = require('../../lib/log').logger;

function Dumper(config) {
    this.config = config;
    this.loader = require('./loader').create(config.lang, config.variant);
}

exports.create = function (config) {
    return new Dumper(config);
};

function loadSkeleton(opt) {
    var file = process.cwd() + '/vendors/distilled/templates/' + opt.cover + '.erb';
    var tmpl = fs.readFileSync(file).toString('utf8');
    opt.forecolor = function (color) {
        if (color === 'white') {
            return 'black';
        } else {
            return 'white';
        }
    };
    return _.template(tmpl)(opt);
}

function mkdir(path) {
    var pathSegments = path.split("/");
    sys.puts(pathSegments);
    if (pathSegments[0] === '') {
        pathSegments = pathSegments.slice(1);
    }
    for (var i = 0; i <= pathSegments.length; i++) {
        var pathSegment = "/" + pathSegments.slice(0, i).join("/");
        try {
            fs.statSync(pathSegment);
        } catch (e) {
            fs.mkdirSync(pathSegment, 0777);
        }
    }
}

function save(date, ext, content) {
    date = date || new Date();
    var year = date.getUTCFullYear(),
        month = date.getUTCMonth() + 1,
        day = date.getUTCDate();
    var file = process.cwd() + '/public/issues/' + year + '/' + month + '/' + day + '.' + ext;
    if (!path.exists(file)) {
        require('sys').puts('create directory to:' + path.dirname(file));
        mkdir(path.dirname(file));
    }
    sys.puts('saving dump to:' + file);
    fs.writeFileSync(file, content);
}

/**
 *  options for dump
 *    --cover center|north|east
 *    --photo feature|featurepic|good|itn|otd|dyk|File:XXXX.ext
 *    --toc itn|dyk|otd|feature|good|featurepic
 */
Dumper.prototype.dump = function (opt) {
    var self = this;
    this.loader.fetch(this.config.mainpage, function (title, data) {
        var mainpage = require('./mainpage').create(
            self.config, data.text['*']
        );
        var skltHtml = loadSkeleton(opt);

        function delayed() {
            var magazine = require('./magazine').create(mainpage.index, skltHtml,
                function () {
                    try {
                        magazine.coverphoto(mainpage.photo(opt.photo));

                        var articles = mainpage.articles,
                            redirection = {};

                        function redirect(from, to) {
                            redirection[to] = from;
                        }

                        function addArticle(article, data) {
                            var title = mainpage.title(redirection[article]);
                            magazine.addArticle(title, data.text['*']);
                        }

                        function end() {
                            magazine.makeup(opt);
                            var date = new Date();
                            save(date, 'json', magazine.toc);
                            save(date, 'html', magazine.html());
                        }

                        self.loader.batchload(articles, redirect, addArticle, end);

                    } catch (e) {
                        logger.error(e);
                    }
                }
            );
        }
        setTimeout(delayed, 5000);
    });
};


