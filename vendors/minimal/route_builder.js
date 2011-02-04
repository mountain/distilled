/**
 * Module dependencies.
 */
var debug = require("./utils").debug;

/*
 * Route Builder
 *
 * route definition dsl => connect.router function
 */
var buffer = "",
    context = {},
    Builder = function () { };

Builder.prototype.build = function (fn) {
    buffer = "";
    fn(this);
    return buffer;
};

Builder.prototype.match = function (method, path) {
    debug("~ #match");
    debug(context);
    var ns = context.namspace;
    debug(ns);
    context.method = method;
    context.path = path;
    context.namespace = context.namespace || "";
    debug(context);
    return this;
};

Builder.prototype.get = function (path) {
    return this.match("get", path);
};

Builder.prototype.post = function (path) {
    return this.match("post", path);
};

Builder.prototype.put = function (path) {
    return this.match("put", path);
};

Builder.prototype.delete = function (path) {
    return this.match("delete", path);
};

Builder.prototype.to = function (name) {
    debug("~ #to");
    var fullpath = context.path;
    if (context.namespace) {
        fullpath = context.namespace + fullpath
    }
    debug(context)
    buffer += "app." + context.method
            + "('" + fullpath + "', "
            + (context.realm ? "withRealm('" + context.realm + "', " : "")
            + "loadHandler('" + name + "')"
            + (context.realm ? ")" : "")
            + ");\n";
    context = {};
    return buffer;
};

Builder.prototype.realm = function (r, handler) {
    debug("~ #realm");
    context.realm = r;
    return handler(this);
};

Builder.prototype.namespace = function (name) {
    debug("~ #namespace");
    var ns = context.namespace;
    context.namespace = ns ? ns : "";
    context.namespace += "/" + name;
    debug(context)
    return this;
};

Builder.prototype.resources = function (name, options) {
    debug("~ #resources");
    // assign handler
    var segments = [name],
        options = options || {},
        params = options.params || "/:id"
    debug(options)
    if (context.namespace) {
        segments.unshift(context.namespace.replace('/', ''))
    }
    var handler = segments.join('/');
        varName = joinVarName(segments) + "Handler";
    buffer += "var " + varName + " = loadHandler('" + handler + "');\n";
    // generate route
    var set = [
        { action: "index",   method: "get",    suffix: "" },
        { action: "new",     method: "get",    suffix: "/new" },
        { action: "create",  method: "post",   suffix: "" },
        { action: "show",    method: "get",    suffix: "%{params}" },
        { action: "edit",    method: "get",    suffix: "%{params}/edit" },
        { action: "update",  method: "put",    suffix: "%{params}" },
        { action: "destroy", method: "delete", suffix: "%{params}" }            
    ];
    var avaliables = ["index", "new", "create", "show", "edit", "update", "destroy"];
    avaliables = filterOut(avaliables, options.excepts, options.onlys);
    for (var i in set) {
        var route = set[i],
            fullpath = '/' + segments.join('/') + route.suffix.replace("%{params}", params);
        if (!avaliables.some(function (el) { return route.action === el; }))
            continue;

        buffer += "app." + route.method
               + "('" + fullpath + "', "
               + (context.realm ? "withRealm('" + context.realm + "', " : "")
               + varName + "." + route.action + ")"
               + (context.realm ? ")" : "")
               + ";\n";
    }
    context = {};
    return buffer;
};

var joinVarName = function (names) {
    debug("~ #joinVarName");
    var converted = [];

    for( var i in names) {
        var name = names[i];
        if (i > 0) {
            name = name[0].toUpperCase() + name.slice(1);
        }
        converted.push(name);
    }
    return converted.join('');
};

/*
*  if only then only - excepts
*  if excepts then set - excepts
*/
var filterOut = function (set, excepts, onlys) {
    debug("~ #filterOut");
    var hasExcepts = excepts && excepts.length > 0;
    if (onlys) {
        if (hasExcepts) {
            return onlys.filter(function (oel){
                return !excepts.some(function (eel) { return eel === oel;});
            });
        } else {
            return onlys;
        }
    }
    if (hasExcepts) {
        return set.filter(function (oel){
            return !excepts.some(function (eel) { return eel === oel;});
        });
    } else {
        return set;
    }
};

module.exports = Builder;
