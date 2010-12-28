var config = {
    lang: 'zh',
    variant: 'zh-cn',
    wiki: 'wiki',
    mainpage: 'Wikipedia:首页'
};

var dumper = require('../vendors/distilled/dumper').create(config);

var opt = {
    cover: 'center',
    photo: 'feature',
    toc: ['itn', 'dyk', 'otd', 'feature', 'good', 'featurepic']
};
dumper.dump(opt);
