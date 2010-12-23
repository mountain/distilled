var _ = require('../../lib/underscore');

var path = require('path'),
    fs   = require('fs'),
    sys  = require('sys');

var logger = require('../../lib/log').logger;

exports.create = function(config) {
    return new Dumper(config);
};

function Dumper(config) {
    this.config = config;
    this.loader = require('./loader').create(config.lang, config.variant);
}

/**
 *  options for dump
 *    --cover center|north|east|west
 *    --photo feature|featurepic|good|itn|otd|dyk|File:XXXX.ext
 *    --index itn|dyk|otd|feature|good|featurepic
 */
Dumper.prototype.dump = function(opt) {
    this.loader.fetch();
};

