var gin = require('gin-downloader');
var Epub = require('epub-comic-gen');

module.exports = function (req, res) {
    var chapters = gin[req.body.downloadSite].images(req.body.downloadName, parseFloat(req.body.chapter))
        .then(x => Promise.all(x)) //resolve all promises
        .then(x => Promise.all(x.map(y => y.value)))
        .then(toDownload)
        .catch(console.log);
    function toDownload (chapters) {
        download(chapters, req.body);
    }
};

var download = function (chapters, body) {
    var fs = require('../helpers/filesystem');

    fs.makeTempDir(fs.tempDir, null, console.log);
    fs.getChapters(chapters, body);
};