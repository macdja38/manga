const DownloadSession = require('../Classes/DownloadSession');
const Download = require('../Classes/Download');
const Manga = require('../Classes/Manga');
const gin = require('gin-downloader');

//TODO: handle errors (stop execution) when chapter object is empty

module.exports = function (req, res) {
    console.log("Received request to download manga");
    //console.dir(req.body);
    let chapters = (typeof req.body.chapter === "string") ? [req.body.chapter] : req.body.chapter;
    
    let array = chapters.map((x) =>
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
            console.log(root);

            let ds = new DownloadSession(new Download(new Manga(req.body.downloadSite, req.body.downloadName), x, req.body.downloadType), root);

            ds.download(err => {
                if (err) { console.log(err) }
                //res.setHeader("Content-Type", "application/" + ((req.body.downloadType === "epub") ? "epub+" : "") + "zip");

                console.log("Making file");
                ds.makeFile(res, err => {
                    if (err) { console.log(err); return; }
                    console.log("Made file successfully");
                    //ds.removeFiles();
                });
            });
        })
        .catch(console.log);
};
