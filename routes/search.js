var gin = require('gin-downloader');

module.exports = function (req, res) {
    gin[req.query.site].filter({name: req.query.searchText})
        .then(x => { res.send(x.results); })
        .catch(console.log);
    console.log("Sent search results to client");
};