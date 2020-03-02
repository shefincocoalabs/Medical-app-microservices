const superagent = require('superagent');
var config = require('../../config/app.config.js');
var gatewayUrl = config.gateway.url;
module.exports = {
    get: async function (path, params) {
        var url = gatewayUrl + path;
        console.log("Routing path " + url + " through gateway");
        return await superagent.get(url)
            .query(params)
            .then((res) => {
                return res.text;
            })
    },

    patch: function (path, params, callback) {
        /**
         * 
         */
        var url = gatewayUrl + path;
        console.log("Routing path " + url + " through gateway");
        superagent.patch(url).send(params).set('Accept', 'application/json').end((err, res) => {
            callback(err, res.body);
        });
    }
}