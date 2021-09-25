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
                const members = this.getGuildMembers();

                for (const member of members) {
                    member.guild.updateMember(member);
                }

                // osu Top Plays Tracking Update
                await (async () => {
                    const isInitilization = (trackingData && (!trackingData.bestScores || Object.keys(trackingData.bestScores).length === 0));

                    const osuUser = await this.getOsuUser();
                    if (!osuUser) return;

                    const bestScores = await osuUser.getBestScores();
                    if (!bestScores) return;

                    bestScores.sort((a, b) => new Date(a.date) - new Date(b.date));

                    function calculatePPWithScores(scores) { // Used for tracking pp gain of plays
                        let total = 0;

                        const weighted = (p, i) => p * Math.pow(0.95, (i - 1));

                        for (let i = 0; i < 100; i++) {
                            const s = scores[i];
                            if (s) {
                                total += weighted(s.P, i + 1);
                            }
                        }

                        return Math.round(total * 100) / 100;;
                    }

                    let newScores = isInitilization
                        ? bestScores
                        : (function findChangesInScores() {
                            let newScores = [];

                            for (const score of bestScores) {
                                let found = false;

                                for (const index in trackingData.bestScores) {
                                    if (trackingData.bestScores[index].S == score.score_id) {
                                        found = true;
                                        break;
                                    }
                                }

                                if (!found) {
                                    newScores.push(score);
                                }
                            }

                            return newScores;
                        })();

                    // Post new score to guilds
                    if (!isInitilization) {
                        const bestScoresNew = trackingData.bestScores.slice();

                        for (const score of newScores) {
                            bestScoresNew.push({
                                S: score.score_id,
                                P: score.profile_pp
                            });

                            bestScoresNew.sort((a, b) => b.P - a.P);

                            let total = calculatePPWithScores(bestScoresNew);
                            let gain = Math.round((total - trackingData.pp) * 100) / 100;

                            trackingData.pp = total;

                            for (const member of members) {
                                member.guild.postMemberOsuScore(member, score, gain);
                            }
                        }
                    }

                    // Post new data to datestorage
                    if (newScores.length > 0) {
                        let compressedScores = {};
                        for (const index in bestScores) {
                            const score = bestScores[index];

                            compressedScores[score.profile_index - 1] = {
                                S: score.score_id,
                                P: score.profile_pp
                            };
                        }

                        trackingData.bestScores = compressedScores;
                        trackingData.pp = calculatePPWithScores(compressedScores);

                        this.Datastore.setSetting('tracking', trackingData);
                    }

                    this.tracker.nextCheck *= (!isInitilization && newScores.length > 0)
                        ? 0.2
                        : 1.5;
                })();

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

    getGuildMembers() {
        let Members = [];

        for (const guild of this.client.guilds._cache) {
            const member = guild[1].members._cache.get(this.id)
            if (member) {
                member.user = this;
                member.guild = this.client.guildHandler.Get(guild[1].id);

                Members.push(member);
            }
        }

        return Members;
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