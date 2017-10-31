var gin = require('gin-downloader');
var Epub = require('epub-comic-gen');

var chnum = 0;

//TODO: handle errors (stop execution) when chapter object is empty

module.exports = function (req, res) {
    //res.sendStatus(200); //TODO: remove artificial 200 status
    console.log("Received request to download manga");
    var i = 0;
    Array.from(req.body.chapter).forEach(x => {
        chnum = req.body.chapter.length;
        gin[req.body.downloadSite].images(req.body.downloadName, parseFloat(x))
            .then(x => Promise.all(x)) //resolve all promises
            .then(x => Promise.all(x.map(y => y.value))) //resolves the other all promises
            .then(console.log("Created array of chapter images"))
            .then(x => { chnum--; download(x, {chapter: req.body.chapter[i++], downloadName: req.body.downloadName, downloadType: req.body.downloadType}, res)})
            .catch(console.log);
    });
};

var download = function (chapter, body, res) {
    var fs = require('../helpers/filesystem');
    console.log("CHNUM", chnum);
    if (chnum === 0) {
        var zipPath = fs.zip(fs.tempDir, function (dir) {
            res.download(dir, body.downloadName + ".zip", function (err) {
                if (err) console.log(err);
                fs.remove(fs.tempDir);
            });
        });

        //TODO: send zip to client
        return;
    }
    fs.makeTempDir(fs.tempDir, null, console.log);
    fs.getChapter(chapter, body);
};