exports.app = function (env) {
    var header = env.templates.admin.users.header;
    var footer = env.templates.admin.users.footer;
    var summary = env.templates.admin.users.summary;
    var empty = env.templates.admin.users.empty;
    var show = env.templates.admin.users.show;
    var edit = env.templates.admin.users.edit;
    return {
        index: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(index());
            } catch (e) {
                require('sys').puts(e.stack);
            }
        },
        empty: function (req, res, next) {
            try {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(empty());
            } catch (e) {
                require('sys').puts(e.stack);
            }
        },
        create: function (req, res, next) {
        },
        show: function (req, res, next) {
        },
        edit: function (req, res, next) {
        },
        update: function (req, res, next) {
        },
        destroy: function (req, res, next) {
        }
    };
};


