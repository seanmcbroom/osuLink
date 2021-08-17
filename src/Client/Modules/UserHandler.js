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
            this.loadAll();

            this.client.on('guildMemberAdd', (member) => {
                this.Add(member.user);
            })

            this.client.on('guildMemberRemove', (member) => {
                if (!this.isUserInAGuild(member.id)) {
                    this.Remove(member.user);
                }
            });
        });
    }

    isUserInAGuild(userId) {
        for (const guild of this.client.guilds._cache) {
            for (const member of guild[1].members._cache) {
                if (member[1].user.id == userId) {
                    return true;
                }
            }
        }

        return false;
    }

    Add(userData) {
        if (!this._cache.get(userData.id) && !this.bot) {
            //console.log(`Added User ${userData.username}`)
            const user = new User(this.client, userData, {
                DataFormat: this.DataFormat
            });

            this._cache.set(userData.id, user);

            return user;
        }
    }

    Remove(userData) {
        //console.log(`Removed User ${userData.username}`)
        return this._cache.delete(userData.id);
    }

    Get(userData) {
        const user = this._cache.get(userData.id);

        if (user) {
            return user
        }

        return this.Add(userData)
    }

    loadAll() {
        for (const guild of this.client.guilds._cache) {
            for (const member of guild[1].members._cache) {
                this.Add(member[1].user);
            }
        }
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

        this.watcher = {
            update: () => {
                //console.log('Update')

                this.watcher.nextUpdate = Date.now() + ((1) * 60 * 60 * 1000);
                this.watcher.lastUpdate = Date.now();
                this.watcher.start();
            },
            start: () => {
                clearTimeout(this.watcher.timer);
                this.watcher.timer = setTimeout(this.watcher.update, (this.watcher.nextUpdate - Date.now()));
            },
            nextUpdate: Date.now(),
            lastUpdate: Date.now()
        }
        this.watcher.start()
    }
}

module.exports = { UserHandler, User };