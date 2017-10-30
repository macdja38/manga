var fs = require('fs');
var path = require('path');
var rs = require('randomstring');
var wget = require('wget-improved');

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
            } else cb(null); // successfully created folder
        });
    },

    getChapters: function (chapters, body) {
        for (i = 0; i < chapters.length; i++){
            var chapterPath = path.join(this.tempDir, body.chapter[i].chap_number + " - " + body.chapter[i].name);
            this.makeTempDir(chapterPath, null, x => {
                chapters[i].forEach(page => {
                    var dl = wget.download(page.src, path.join(chapterPath, page.name));
                });
            });
        }
    }
};