#!/usr/bin/env node

require('../lib/log');

var fs = require('fs'),
server = require('../vendors/minimal/server'),
sys = require('sys');

var ultrafilter = process.argv[1],
    len = ultrafilter.length,
    path = ultrafilter.substring(0, len - 23);

logger.info("start ultrafilter at " + path);

server.start(path);

