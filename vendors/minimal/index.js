/*
 * Minimal web framework
 *
 *  This is the core of distilled
 *
 */

var Minimal = new Object();

Minimal.logger = require("./logger");

Minimal.server = require("./server");

Minimal.environment = require("./environment");

module.exports = Minimal;
