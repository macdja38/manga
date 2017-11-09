class Manga {
    constructor (site, name) {
        this._site = site;
        this._name = name;
    }

    get name () {
        return this._name;
    }

    get site () {
        return this._site;
    }
}

module.exports = Manga;