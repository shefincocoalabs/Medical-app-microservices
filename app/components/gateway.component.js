const superagent = require('superagent');
var config = require('../../config/app.config.js');
var gatewayUrl = config.gateway.url;
module.exports = {
    getWithAuth: async function (path, params,bearer) {
        var url = gatewayUrl + path;
        console.log("Routing path " + url + " through gateway");
        return await superagent.get(url)
            .query(params)
            .set({'Content-Type': 'application/json', 'authorization':  bearer})
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