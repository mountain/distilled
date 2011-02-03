exports.settings = function (r) {
    r.get("/").to("main");
    r.get("/issues/:year/:month/:day").to("issues");
    r.get("/styles/magazine.css").to("style");
    r.namespace("admin").resources("users", {excepts: ["new"]});
    r.namespace("editor").resources("issues", {
        params: "/:year/:month/:day",
        onlys: ["show", "update"]
    });
};
