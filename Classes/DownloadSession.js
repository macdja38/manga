const rs = require('randomstring');
const fs = require('fs-extra');
const wget = require('wget-improved');
const archiver = require('archiver');

class DownloadSession {
    constructor (download, path) {
        this._download = download;
        this._tempDir = path + "/tmp/" + rs.generate();
    }

    download (callback) {
        console.dir(this._download);
        this.makeTempDir(this._tempDir, x => {
            if (x) { console.log(x); return; }
            this.getChapters(callback);
        });
    }

    makeTempDir (path, cb) {
        fs.mkdir(path, 0o777, function(err) {
            if (err) {
                if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
                else cb(err); // something else went wrong
            } else {
                cb(null);
                console.log("Made directory at " + path);
            } // successfully created folder
        });
    }

    getChapters (callback) {
        Promise.all(this._download.chapters.map(chapter => {
            let path = this._tempDir + "/" + chapter[0];
            return new Promise(resolve => {
                this.makeTempDir(path, err => {
                    if (err) { console.log(err); return; }
                    chapter[1].forEach(page => {
                        wget.download(page.src, path + "/" + page.name)
                            .on('end', resolve);
                    });
                });
            });
        }))
            .then(x => {
                callback();
            })
            .catch(console.log);
    }

    removeFiles () {
        try {
            console.log("removing directory");
            fs.remove(this._tempDir, err => {
                if (err) console.log(err);
                console.log("Removed directory")
            });
            console.log("removing zip");
            fs.unlink(this._tempDir + ".zip", err => {
                if (err) console.log(err);
                console.log("Removed zip")
            });
        }
        catch (err) {
            console.log(err);
        }
    }

    makeFile (res, callback) {
        let stream;
        if (this._download.downloadType === "epub") {
            let epubPath = this._tempDir;
            let epub = new Epub(epubPath, epubPath, this._download.manga.name + ".pub", this._download.manga.name);
            epub.genrate((err, file) => {
                if (err) { callback(err); return; }
                stream = fs.createReadStream(file).pipe(res);
                stream.on('end', (err) => {
                    if (err) { callback(err); return; }
                    callback(null);
                });
            });
        }
        else {
            let zip = archiver.create('zip', { zlib: { level: 9 }});
            zip.directory(this._tempDir, false);
            let ws = fs.createWriteStream(this._tempDir + "/" + this._download.manga.name + ".zip");
            zip.pipe(ws);
            stream = fs.createReadStream(this._tempDir + "/" + this._download.manga.name + ".zip");
            stream.pipe(res);
            zip.on('end', (x) => {
                ws.close();
            });
            stream.on('end', callback);
            zip.finalize();
        }
    }


}

module.exports = DownloadSession;