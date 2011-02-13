# Distilled

Distilled is the support system for wikiedge.org which achieve the everyday
changes on the Mainpage of Chinese Wikipedia and then remix related content into
a magazine.

Distilled is composed by:

 * several maintenance scripts to dump wikipedia pages into a magazine
 * server to serve the magazine
 * online editor to edit the magazine
 * user administration

## How to start

Please follow below steps:

 * install [nodejs](http://nodejs.org), please install version > 0.4.0
 * install [npm](http://npmjs.org)
 * cd /path/to/put/distilled
 * run `git clone git://github.com/mountain/distilled.git` to clone repository
 * `cd distilled`
 * install all dependencies by `npm bundle`
 * copy several *.js.example files under config directory to *.js
 * generate magazine data, `./bin/magazine -c center -p dyk -b black`
 * generate calander html, `./bin/index`
 * start distilled server, `./bin/start`
 * okay, open http://localhost:8080/ in your browser

The parameters of dump.js should be changed according to your choice of the
cover style of the magazine. See belwo section for details.

## Cover style of the magazine

Run the command "node scripts/dump.js --help", it will give you some hints.

    -c, --cover [TEXT]   full|center|north|west
    -p, --photo [TEXT]   feature|featurepic|good|itn|otd|dyk|XXXX.ext
    -b, --bg [TEXT]      aqua|black|blue|fuchsia|gray|green|lime|maroon|....

The above three command options are the most important.

The "-c" option gives the cover style which is one of full, center, north, west.

The "-p" option gives the photo of the magazine, you can set it to the file name
of a photo or one section name on the Wikipedia Mainpage.

 * feature 特色条目
 * featurepic 特色图片
 * good 优良条目
 * itn 新闻动态
 * otd 历史上的今天
 * dyk 你知道吗
 * XXXX.ext 文件名

The "-b" option gives the background color of the magazine.
