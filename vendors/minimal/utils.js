exports.debug = function (msg) {
    if (!process.env['DEBUG']) {
        return;
    }
    if (typeof msg === "string") {
        console.log(msg);
    } else {
        console.dir(msg);
    }
}
