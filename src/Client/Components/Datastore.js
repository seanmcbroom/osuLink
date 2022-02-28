const firebase = require('firebase');

class Firebase {
    constructor(options = {}) {
        const {
            FirebaseLogin = {},
        } = options;

        firebase.initializeApp(FirebaseLogin);

        this.Database = firebase.database();
    }

    async get(path) {
        return this.Database.ref(path).once('value');
    }

    async set(path, value) {
        await this.Database.ref(path).set(value);
    }
}

class Datastore {
    constructor(Group, options = {}) {
        const {
            Database = {},
            DataFormat = {},
            id = 1,
        } = options;

        this.Database = Database

        this._cache = new Map();

        this.DataFormat = DataFormat;
        this.Group = Group;
        this.id = id;
    }

    async getData(setting) {
        return new Promise(async (resolve) => {
            if (this._cache[setting]) {
                resolve(this._cache[setting])
            }

            this.Database.get(`${this.Group}/${this.id}`)
                .then(async snapshot => {
                    snapshot = snapshot.val();

                    if (!snapshot) {
                        const DefaultData = this.DataFormat;

                        snapshot = DefaultData;
                        await this.Database.set(`${this.Group}/${this.id}`, DefaultData);
                    }

                    if (!snapshot[setting]) {
                        const DefaultValue = this.DataFormat[setting];

                        snapshot[setting] = DefaultValue;
                        await this.setSetting(this.id, setting, DefaultValue);
                    }

                    for (const index in snapshot) {
                        this._cache.set(index, snapshot[index]);
                    }

                    resolve(snapshot[setting]);
                })
        })



    }

    async setSetting(setting, value) {
        this._cache.set(setting, value);

        await this.Database.set(`${this.Group}/${this.id}/${setting}`, value);
    }
}


module.exports = { Firebase, Datastore };