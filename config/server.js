exports.settings = {
    host: 'localhost',
    port: 8080,
    admin: 'me@mingli-yuan.info',
    baseUrl: function() {
        if(this.port===80)
            return 'http://' + this.host;
        else
            return 'http://' + this.host + ':' + this.port;
    },
};
