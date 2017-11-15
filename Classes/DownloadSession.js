const rs = require('randomstring');
const fs = require('fs-extra');
const wget = require('wget-improved');
const archiver = require('archiver');
const Epub = require('epub-comic-gen');

class DownloadSession {
    constructor (download, path) {
        this._download = download;
        this._tempDir = path + "/tmp/" + rs.generate();
    }

    download (callback) {
        this.makeTempDir(this._tempDir, err => {
            if (err) { console.log(err); return; }
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
            // console.log("removing zip");
            // let suffix = (this._download.fileType === 'epub') ? ".epub" : ".zip";
            // fs.unlink(this._tempDir + suffix, err => {
            //     if (err) console.log(err);
            //     console.log("Removed zip")
            // });
        }
        catch (err) {
            console.log(err);
        }
    }

    makeFile (res, callback) {
        let stream;
        if (this._download.fileType === "epub") { //TODO: make epub for each chapter using epub-comic-gen, then join using something else
            console.log("Making epub");
            let epubPath = this._tempDir;
            let epub = new Epub(epubPath, epubPath, this._download.manga.name + ".pub", this._download.manga.name);
            console.log("Generating epub");
            epub.genrate((err, file) => {
                console.log("Finished generating epub");
                if (err) { callback(err); return; }
                stream = fs.createReadStream(file);
                console.log("Streaming file");
                stream.on('end', (err) => {
                    if (err) { callback(err); return; }
                    console.log("Finished streaming");
                    callback(null);
                });
                stream.pipe(res);
            });
        }
        else { //TODO: clean this up
            console.log("Making zip");
            let output = fs.createWriteStream(this._tempDir + ".zip");
            let archive = archiver.create('zip', { zlib: { level: 9 }});

            output.on('close', () => {
                console.log(archive.pointer() + ' total bytes');
                console.log("archiver has been finalized and the output file descriptor has closed");

                res.download(this._tempDir + ".zip", this._download.manga.name + ".zip");
                callback(null);

                // stream = fs.createReadStream(this._tempDir + "/" + this._download.manga.name + ".zip");
                // console.log("Created read stream");
                // stream.pipe(res);
                // console.log("Piping read stream to client");
                // //cb(outputPath);
                //stream.on('end', x => { callback(null) });
            });

            output.on('end', function() {
                console.log('Data has been drained');
            });

            archive.on('warning', function(err) {
                if (err.code === 'ENOENT') {
                    console.assert("ENOENT");
                } else {
                    // throw error
                    throw err;
                }
            });

            archive.on('error', function(err) {
                throw err;
            });

            archive.pipe(output);

            archive.directory(this._tempDir, false);

            archive.finalize();
        }
    }


}

module.exports = DownloadSession;