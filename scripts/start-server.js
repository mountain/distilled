#!/usr/bin/env node

require('../lib/log');

var fs = require('fs'),
server = require('../vendors/minimal/server'),
sys = require('sys');

var distilled = process.argv[1],
    len = distilled.length,
    path = distilled.substring(0, len - 23);

logger.info("start distilled at " + path);

server.start(path);

