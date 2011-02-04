var vows = require('vows'),
    assert = require('assert'),
    Builder = require("../vendors/minimal/route_builder");

var fixtures = {
    simple: function (r) {
        r.get('/').to("main")
    },
    namespace: function (r) {
        r.namespace("my").get("/dashboard").to("dashboard");
    },
    resources: function (r) {
         r.namespace("admin").resources("users");
    },
    optionalResources: function (r) {
        r.namespace("editor").resources("issues", {
            params: "/:year/:month/:day",
            onlys: ["show", "update"]
        });
    },
    realm: function (r) {
        r.realm("admin", function (admin) {
            admin.get("/test").to("test");
        });
    },
    resourcesWithRealm: function (r) {
        r.realm("admin", function (admin) {
            admin.namespace("admin").resources("users");
        });
    },
};

vows.describe('Route builder').addBatch({
    "Route generation": {
        topic: function () { return new Builder(); },
        "with simple route": function (topic) {
            assert.equal(topic.build(fixtures.simple),
                         "app.get('/', loadHandler('main'));\n");
        },
        "with namespace": function (topic) {
            assert.equal(topic.build(fixtures.namespace),
                         "app.get('/my/dashboard', loadHandler('dashboard'));\n");
        },
        "with resources": function (topic) {
            assert.equal(topic.build(fixtures.resources),
                         "var adminUsersHandler = loadHandler('admin/users');\n"
                         + "app.get('/admin/users', adminUsersHandler.index);\n"
                         + "app.get('/admin/users/new', adminUsersHandler.new);\n"
                         + "app.post('/admin/users', adminUsersHandler.create);\n"
                         + "app.get('/admin/users/:id', adminUsersHandler.show);\n"
                         + "app.get('/admin/users/:id/edit', adminUsersHandler.edit);\n"
                         + "app.put('/admin/users/:id', adminUsersHandler.update);\n"
                         + "app.delete('/admin/users/:id', adminUsersHandler.destroy);\n");
        },
        "with optional resources": function (topic) {
            assert.equal(topic.build(fixtures.optionalResources),
                         "var editorIssuesHandler = loadHandler('editor/issues');\n"
                         + "app.get('/editor/issues/:year/:month/:day', editorIssuesHandler.show);\n"
                         + "app.put('/editor/issues/:year/:month/:day', editorIssuesHandler.update);\n");
        },
        "with realm": function (topic) {
            assert.equal(topic.build(fixtures.realm),
                         "app.get('/test', withRealm('admin', loadHandler('test')));\n");
        },
        "with realm resources": function (topic) {
            assert.equal(topic.build(fixtures.resourcesWithRealm),
                         "var adminUsersHandler = loadHandler('admin/users');\n"
                         + "app.get('/admin/users', withRealm('admin', adminUsersHandler.index));\n"
                         + "app.get('/admin/users/new', withRealm('admin', adminUsersHandler.new));\n"
                         + "app.post('/admin/users', withRealm('admin', adminUsersHandler.create));\n"
                         + "app.get('/admin/users/:id', withRealm('admin', adminUsersHandler.show));\n"
                         + "app.get('/admin/users/:id/edit', withRealm('admin', adminUsersHandler.edit));\n"
                         + "app.put('/admin/users/:id', withRealm('admin', adminUsersHandler.update));\n"
                         + "app.delete('/admin/users/:id', withRealm('admin', adminUsersHandler.destroy));\n");
        }
    }
}).export(module);
