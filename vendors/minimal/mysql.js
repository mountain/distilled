var sqlclient = require("../libmysqlclient/mysql-libmysqlclient");

var util = require('../../lib/log');

function PseudoConn(host, user, pwd, db, port) {
  this.config = {
    host: host,
    user: user,
    pwd: pwd,
    db:db,
    port: port,
  };
  this.connect();
}

PseudoConn.prototype.connect = function() {
  var conf = this.config,
  url  = 'mysql://' + conf.host + ':' + conf.port + '/' + conf.db;
  logger.info('connecting to ' + url);
  //logger.debug('user: ' + conf.user);
  //logger.debug('pwd: ' + conf.pwd);
  this.conn = sqlclient.createConnectionSync(conf.host, conf.user, conf.pwd, conf.db, conf.port);
  this.conn.querySync("SET character_set_client = utf8");
  this.conn.querySync("SET character_set_results = utf8");
  this.conn.querySync("SET character_set_connection = utf8");
  logger.info('connected to ' + url);
};

PseudoConn.prototype.query = function(callback, sql) {
  var pconn = this;
  var callbackWithErr = function(err, results) {
    if(err) {
      logger.error("err at query: " + err);
      pconn.check();
    } else {
      try {
        if(callback) callback(new PseudoResult(this, results));
      } catch(e) {
        logger.error("err in query callback: " + e);
      }
    }
  };
  this.conn.query(sql, callbackWithErr);
}

PseudoConn.prototype.querySync = function(callback, sql) {
  var pconn = this;
  var results = undefined;
  try {
    results = this.conn.querySync(sql);
  } catch(e) {
    logger.error("err at query: " + e);
    pconn.check();
  }
  if(results !== undefined) try {
    if(callback) callback(new PseudoResult(this, results));
    if(results && results !== true) results.freeSync();
  } catch(e) {
    logger.error("err in query callback: " + e);
  }
}

PseudoConn.prototype.queryFetch = function(callback, sql) {
  var fetch = function(rows) {
    callback(rows);
  };
  this.query(function(results) {
    results.fetchAll(fetch);
  }, sql);
}

PseudoConn.prototype.queryFetchSync = function(callback, sql) {
  var fetch = function(rows) {
    callback(rows);
  };
  this.querySync(function(results) {
    results.fetchAllSync(fetch);
  }, sql);
}

PseudoConn.prototype.check = function() {
  this.conn.query(function(err, results) {
    logger.error("check connection and keep alive.");
    if(err) {
      this.connect();
      logger.error("reconnect to db.");
    }
  }, "select 1");
}

function PseudoResult(conn, results) {
  this.conn = conn;
  this.results = results;
}

PseudoResult.prototype.fetchAll = function(callback) {
  var pr = this;
  var callbackWithErr = function(err, rows) {
    if(err) {
      logger.error("err at fetching: " + err);
      pr.conn.check();
    } else {
      try {
        if(callback) callback(rows);
      } catch(e) {
        logger.error("err in fetch callback: " + e);
      }
    }
  };
  this.results.fetchAll(callbackWithErr);
}

PseudoResult.prototype.fetchAllSync = function(callback) {
  var pr = this;
  var rows = undefined;
  try {
    rows = this.results.fetchAllSync();
  } catch(e) {
    logger.error("err at fetching: " + e);
    pr.conn.check();
  }
  if(rows !== undefined) try {
    if(callback) callback(rows);
  } catch(e) {
    logger.error("err in fetch callback: " + e);
  }
}

function connect (host, user, pwd, db, port) {
  var pconn =  new PseudoConn(host, user, pwd, db, port);

  var check = function() {
    pconn.conn.query("select 1", function(err, results) {
      logger.info("check connection and keep alive.");
      if(err) {
        pconn.connect();
        logger.info("reconnect to db.");
      }
    });
  };
  setInterval(check, 60*1000);

  return pconn;
}

function connectByUrl (url) {
    var parsed = require('url').parse(url), auth = parsed.auth.split(':');
    if(parsed.protocol !== 'mysql:') throw 'wrong protocol for mysql!'

    return connect(parsed.hostname, auth[0], auth[1],
        parsed.pathname.substring(1), parsed.port);
}

exports.connect = connect;
exports.connectByUrl = connectByUrl;
