exports.settings = function (r) {
    r.get("/").to("main");
    r.get("/issues/:year/:month/:day").to("issues");
    r.get("/styles/magazine.css").to("style");

    r.realm("admin", function (admin) {
        admin.namespace("admin").resources("users", {excepts: ["new"]});
    });

    r.realm("editor", function (editor) {
        editor.namespace("editor").resources("issues", {
            params: "/:year/:month/:day",
            onlys: ["show", "update"]
        });
    });
};
