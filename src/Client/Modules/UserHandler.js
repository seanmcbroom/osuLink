const { Datastore } = require('./Datastore');
const Discord = require('discord.js');

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

        this.track();
    }

    track() {
        this.tracker = {
            check: async () => {
                const trackingData = await this.Datastore.getData('tracking');
                const guilds = this.getGuilds();

                const checkOsuScores = async () => {
                    const osuUser = await this.getOsuUser();
                    if (!osuUser) return;

                    let newScores = [];
                    const bestScores = await osuUser.getBestScores();
                    if (!bestScores) return;

                    const bestScoresExist = trackingData.bestScores && Object.keys(trackingData.bestScores).length > 0
                    let foundNewScore = false;

                    for (const score of bestScores) {
                        let found = false;

                        if (bestScoresExist) {
                            for (const index in trackingData.bestScores) {
                                if (trackingData.bestScores[index].S == score.score_id) {
                                    found = true;
                                    break;
                                }
                            }
                        }

                        if (!found) {
                            newScores.push(score);
                            foundNewScore = true;
                        }
                    }

                    this.tracker.nextCheck *= (foundNewScore) ? 0.2 : 1.5;

                    if (newScores.length > 0 && bestScoresExist) { // Post new scores to guilds
                        for (const score of newScores) {
                            const weighted = (p) => p * Math.pow(0.95, (score.profile_index - 1));

                            let gain;
                            if (trackingData.bestScores[score.profile_index - 1]) {
                                const previousScorePerformance = trackingData.bestScores[score.profile_index - 1].P;
                                gain = Math.round((weighted(score.profile_pp) - weighted(previousScorePerformance)) * 100) / 100;
                            } else {
                                gain = Math.round(weighted(score.profile_pp) * 100) / 100;
                            }

                            for (const guild of guilds) {
                                guild.postMemberOsuScore(this, score, gain);
                            }
                        }
                    }

                    if (newScores.length > 0) { // Push new data to tracking
                        let compressedScores = {};
                        for (const index in bestScores) {
                            const score = bestScores[index];

                            compressedScores[index] = {
                                S: score.score_id,
                                P: score.profile_pp
                            };
                        }

                        trackingData.bestScores = compressedScores;
                        trackingData.pp = osuUser.pp_raw;

                        this.Datastore.setSetting('tracking', trackingData);
                    }
                }

                for (const guild of guilds) {
                    guild.updateMember(this);
                }

                await checkOsuScores();

                if (this.tracker) {
                    this.tracker.nextCheck = Math.min(Math.max(this.tracker.nextCheck, 0.1), 2); // Clamp next check between 0.1 and 2

                    this.tracker.start();
                }
            },

            start: () => {
                clearTimeout(this.tracker.timer);
                this.tracker.timer = setTimeout(this.tracker.check, (this.tracker.nextCheck * 60 * 60 * 1000));
            },

            nextCheck: 0, // Time in hours between checks
        }

        this.tracker.start()
    }

    getGuilds() {
        let Guilds = [];

        for (const guild of this.client.guilds._cache) {
            if (guild[1].members._cache.get(this.id)) {
                const Guild = this.client.guildHandler.Get(guild[1].id);

                Guilds.push(Guild);
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