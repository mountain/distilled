exports.settings = function (r) {
    r.get("/").to("main");
    r.get("/styles/magazine.css").to("style");

    r.namespace("issues").get("/").to("issues/index");
    r.namespace("issues").get("/calendar/:year/:month").to("issues/calendar");
    r.namespace("issues").get("/:year/:month/:day").to("issues/issue");

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
