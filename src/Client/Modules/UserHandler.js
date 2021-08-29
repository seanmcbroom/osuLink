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
        const user = this._cache.get(userData.id);
        if (!user && !userData.bot) {
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

        for (const x in user) {
            this[x] = user[x];
        };

        this.Datastore = new Datastore('User', {
            Database: this.client.Database,
            DataFormat: DataFormat,
            id: this.id
        });

        this.watchForUpdates();
    }

    watchForUpdates() {
        this.watcher = {
            check: async () => {
                const getNewOsuScores = async () => {
                    let newScores = [];

                    const osuUser = await this.getOsuUser();

                    if (osuUser) {
                        const bestScoresOld = await this.Datastore.getData('bestScores');
                        const bestScores = await osuUser.getBestScores();

                        if (bestScores) {
                            if (Object.keys(bestScoresOld).length > 0) { // Check for new scores
                                for (const score of bestScores) {
                                    let found = false;
                                    for (const oldScore of bestScoresOld) {
                                        if (oldScore.S == score.score_id) {
                                            found = true;
                                            break
                                        }
                                    }
                                    if (!found) newScores.push(score);
                                }
                            }

                            if ((Object.keys(bestScoresOld).length <= 0) || (newScores.length > 0)) { // Push new scores to datastore
                                let compressedScores = {};

                                for (const index in bestScores) {
                                    const score = bestScores[index];

                                    compressedScores[index] = {
                                        S: score.score_id
                                    };
                                }

                                this.Datastore.setSetting('bestScores', compressedScores);
                            }
                        }
                    }

                    return newScores;
                }

                const newScores = await getNewOsuScores();

                for (const guild of this.getGuilds()) {
                    guild.updateMember(this);

                    for (const score of newScores) {
                        guild.postMemberOsuScore(this, score);
                    }
                }

                if (this.watcher) {
                    this.watcher.nextCheck *= (newScores.length > 0) ? 0.5 : 1.5;
                    this.watcher.nextCheck = Math.min(Math.max(this.watcher.nextCheck, 0.1), 1.5); // Clamp next check between 0.1 and 1.5

                    this.watcher.start();
                }
            },

            start: () => {
                clearTimeout(this.watcher.timer);
                this.watcher.timer = setTimeout(this.watcher.check, (this.watcher.nextCheck * 60 * 60 * 1000));
            },

            nextCheck: 0, // Time in hours between checks
        }

        this.watcher.start()
    }

    getGuilds() {
        let Guilds = [];

        for (const guild of this.client.guilds._cache) {
            for (const member of guild[1].members._cache) {
                if (member[1].user.id == this.id) {
                    const Guild = this.client.guildHandler.Get(guild[1].id);
                    Guilds.push(Guild);
                }
            }
        }

        return Guilds;
    }

    async getOsuUser() {
        if (!this.client.osu) return null

        const osuID = await this.Datastore.getData('osuID');
        if (!osuID) return null

        const osuUser = await this.client.osu.getUser({ identifier: osuID, identifierType: 'id' });
        if (!osuUser) return null

        return osuUser
    }
}

module.exports = { UserHandler, User };