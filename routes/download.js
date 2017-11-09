const DownloadSession = require('../Classes/DownloadSession');
const Download = require('../Classes/Download');
const Manga = require('../Classes/Manga');
const gin = require('gin-downloader');
const Epub = require('epub-comic-gen');

let chnum = 0;

//TODO: handle errors (stop execution) when chapter object is empty

module.exports = function (req, res) {
    console.log("Received request to download manga");
    //console.dir(req.body);
    let array = req.body.chapter.map((x) =>
        gin[req.body.downloadSite].images(req.body.downloadName, parseFloat(x))
            .then(x => Promise.all(x)) //resolve all promises
            .then(x => Promise.all(x.map(y => y.value))).then(manga => [x, manga]) //resolves the other all promises
            .catch(console.log)
    );
    Promise.all(array)
        .then(x => {
            //console.dir(x, { depth: 20 });
            let root = (() => {
                let x = __dirname.split('/');
                x.pop();
                return x.join('/');
            })();

            let ds = new DownloadSession(new Download(new Manga(req.body.downloadSite, req.body.downloadName), x, req.body.downloadType), root);

            ds.download(err => {
                res.setHeader("Content-Type", "application/" + ((req.body.downloadType === "epub") ? "epub+" : "") + "zip");

                ds.makeFile(res, err => {
                    if (err) { console.log(err); return; }
                    ds.removeFiles();
                });
            });
        })
        .catch(console.log);
};