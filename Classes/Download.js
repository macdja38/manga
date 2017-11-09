class Download {
    constructor (manga, chapters, type) {
        this._manga = manga;
        this._chapters = chapters;
        this._type = type;
    }

    get manga () {
        return this._manga;
    }

    get chapters () {
        return this._chapters;
    }

    get type () {
        return this._type;
    }
}

module.exports = Download;