var _ = require('underscore');

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

function findSettings(date, n) {
    n = n || 1;
    var prev = new Date(date.getTime() - n * 24 * 3600 * 1000),
        year = prev.getUTCFullYear(),
        month = prev.getUTCMonth() + 1,
        day = prev.getUTCDate();

    var file = process.cwd() + '/public/issues/' + year + '/' + month + '/' + day + '.json',
    prevSettings = '{"index":[]}';
    if (n < 7) {
        try {
            prevSettings = fs.readFileSync(file).toString('utf8');
            logger.info('loading previous settings at ' + file);
        } catch (e) {
            prevSettings = findSettings(date, n + 1);
        }
    }
    return prevSettings;
}

function filterPrev(mainpage, articles, now) {
    var json = JSON.parse(findSettings(now)),
        index = _(json.index).chain().values().flatten().unique().value();

    logger.info('comparing... ');
    return _.select(articles, function (article) {
        var keep = _.indexOf(index, article) === -1 &&
                   _.indexOf(index, mainpage.title(article)) === -1;
        if(keep) {
            logger.info('keep ' + article);
        } else {
            logger.info('reject ' + article);
        }
        return keep;
    });
}

/**
 *  options for dump
 *    --cover full|center|north|west
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
                        var date = new Date();

                        var photo = mainpage.photo(opt.photo);
                        if (!photo) {
                            photo = opt.photo;
                        }
                        magazine.coverphoto(photo);

                        var articles = mainpage.articles,
                            redirection = {};

                        articles = filterPrev(mainpage, articles, date);

                        function redirect(from, to) {
                            redirection[to] = from;
                        }

                        function addArticle(article, data) {
                            var title = mainpage.title(redirection[article]);
                            logger.info("add article: " + title);
                            magazine.addArticle(title, data.text['*']);
                        }

                        function end() {
                            var simplified = articles.map(function (article) {
                                return mainpage.title(redirection[article]);
                            });
                            magazine.makeup(opt, simplified);
                            var settings = {
                                cover: opt.cover,
                                photo: photo,
                                bg: opt.bg,
                                index: magazine.index,
                                articles: simplified
                            };
                            _.extend(settings, magazine.toc);
                            save(date, 'json', JSON.stringify(settings));
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


