var fs = require('fs-extra');
var path = require('path');
var rs = require('randomstring');
var wget = require('wget-improved');
var a = require('archiver');

//TODO: diagnose and fix issues with actually downloading requested manga and zipping it

module.exports = {
    tempDir: path.join(__dirname, "/tmp", rs.generate()),

    makeTempDir: function (path, mask, cb) {
        if (typeof mask == 'function') { // allow the `mask` parameter to be optional
            cb = mask;
            mask = 0777;
        }
        fs.mkdir(path, mask, function(err) {
            if (err) {
                if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
                else cb(err); // something else went wrong
            } else {
                cb(null);
                console.log("Made directory at " + path);
            } // successfully created folder
        });
    },

    getChapter: function (chapter, body) { //TODO: add epub conversion if downloadType is such
        console.log("Awaiting chapters promise");
        var i = 0;
        Promise.all(chapter).then(x => {
            console.log("Downloading chapter");
            var chapterPath = path.join(this.tempDir, body.chapter + " - " + body.downloadName);
            this.makeTempDir(chapterPath, null, x => {
                chapter.forEach(page => {
                    var dl = wget.download(page.src, path.join(chapterPath, page.name));
                    console.log("Finished downloading page");
                });
            });
        });
    },

    zip: function (path, cb) {
        console.log("Preparing to create zip");
        var outputPath = this.tempDir + ".zip";
        var output = fs.createWriteStream(outputPath);
        var archive = a('zip', {
            zlib: { level: 5 }
        });

        output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log("archiver has been finalized and the output file descriptor has closed");
            cb(outputPath);
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

        archive.directory(this.tempDir, false);

        console.log("Making zip");

        archive.finalize();
    },

    remove: function (dir) {
        console.log("removing directory");
        fs.remove(dir, err => {if (err) console.log(err); console.log("Removed directory")});
        console.log("removing zip");
        fs.unlink(dir + ".zip", err => {if (err) console.log(err); console.log("Removed zip")});
    }
};