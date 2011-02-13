#!/usr/bin/env node

var fs = require('fs'),
    sys = require('sys');

var logger = require('../lib/log').logger,
    server = require('../vendors/minimal/server');

var distilled = process.argv[1],
    len = distilled.length,
    path = distilled.substring(0, len - 23);

logger.info("start distilled at " + path);

server.start(path);
