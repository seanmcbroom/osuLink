const { Datastore } = require('./Datastore');

class UserHandler {
    constructor(client, options = {}) {
        const {
            DataFormat = {}
        } = options;

        this.client = client;

        this._cache = new Map();

        this.DataFormat = DataFormat;

        this.setup();
    }

    setup() {
        this.client.once('ready', () => {
            // this.client.on('guildMemberRemove', (member) => {
            //     if (!this.isUserInAGuild(member.id)) {
            //         this.Remove(member.id);
            //     }
            // });
        });
    }

    // isUserInAGuild(userId) {
    //     for (const guild of this.client.guilds._cache) {
    //         for (const member of guild[1].members._cache) {
    //             if (member[1].user.id == userId) {
    //                 return true;
    //             }
    //         }
    //     }

    //     return false;
    // }

    Add(userData) {
        const user = new User(this.client, userData, {
            DataFormat: this.DataFormat
        });

        this._cache.set(userData.id, user);

        return user;
    }

    Remove(userData) {
        return this._cache.delete(userData.id);
    }

    Get(userData) {
        const user = this._cache.get(userData.id);

        if (user) return user

        return this.Add(userData);
    }
}

class User {
    constructor(client, user, options) {
        const {
            DataFormat = {}
        } = options;

        this.client = client;

        this.id = user.id;

        this.Datastore = new Datastore('User', {
            Database: this.client.Database,
            DataFormat: DataFormat,
            id: this.id
        });
    }
}

module.exports = { UserHandler, User };