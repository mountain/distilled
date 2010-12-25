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

function loadSkeleton(coverType) {
    var file = process.cwd() + '/vendors/distilled/templates/' + coverType + '.html';
    return fs.readFileSync(file);
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
    this.loader.fetch(this.config.mainpage, function (data) {
        var mainpage = require('./mainpage').create(
            this.config, data.text['*']),
            skltHtml = loadSkeleton(opt.cover),
            magazine = require('./magazine').create(mainpage.index, skltHtml);

        magazine.coverphoto(mainpage.photo(opt.photo));

        var articles = mainpage.articles(),
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

        this.loader.batchload(articles, redirect, addArticle, end);
    });
};


