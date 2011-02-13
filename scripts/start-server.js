#!/usr/bin/env node

var path = require("fs").realpathSync(__dirname + "/.."),
    Minimal = require("../vendors/minimal"),
    server = Minimal.server,
    logger = Minimal.logger;

logger.info("start distilled at " + path);

server.start(path);
