const request = require('request-promise');
const Score = require('./Score');

class User {
    /**
     * Creates a new Beatmap object
     * @param {Object} [osu] The main osu module
     * @param {Object} [options={}]
     * @param {Object} [options.userData={}]
     */
    constructor(osu, options) {
        const {
            userData = null,
        } = options;

        for (const x in userData) {
            this[x] = userData[x];
        };

        this.avatar = `http://s.ppy.sh/a/${this.user_id}`;
        this.profile_link = `https://osu.ppy.sh/users/${this.user_id}`;

        this.osu = osu;

        this._webscrape();
    }

    /**
     * Gets users most recent score
     * @param {Object} [options={}]
     * @param {String} [options.filter] The method which recent scores will be filtered.
     * @returns {Promise<Score>} Most recent score
     */
    async getRecent(options = {}) {
        const {
            filter = 'recent'
        } = options;

        const filters = {
            'recent': async (recentScores) => { return recentScores[0] },
            'best': async (recentScores) => {
                let highest = null;
                let highestpp = 0;

                for (const score of recentScores) {
                    const beatmap = await this.osu.getBeatmap({ id: score.beatmap_id });
                    const play = new Score({ scoreData: score, beatmap: beatmap });
                    const pp = play.pp();

                    if (pp > highestpp) {
                        highest = score;
                        highestpp = pp;
                    }
                }

                return highest;
            },
            'worst': async (recentScores) => {
                let worst = null;
                let worstpp = 10000;

                for (const score of recentScores) {
                    const beatmap = await this.osu.getBeatmap({ id: score.beatmap_id });
                    const play = new Score({ scoreData: score, beatmap: beatmap });
                    const pp = play.pp();

                    console.log(pp);

                    if (pp < worstpp) {
                        worst = score;
                        worstpp = pp;
                    }
                }

                return worst;
            },
            'random': async (recentScores) => {
                return recentScores[Math.round(Math.random() * recentScores.length)]
            },
        }

        return new Promise((resolve) => {
            this.osu.api.apiCall('/get_user_recent', { m: 0, limit: 20, u: this.user_id, type: 'id' })
                .then(async recentScores => {
                    if (recentScores.length <= 0) return resolve(null);

                    const filteredScore = await filters[filter](recentScores);
                    const beatmap = await this.osu.getBeatmap({ id: filteredScore.beatmap_id });
                    const score = new Score({ scoreData: filteredScore, beatmap: beatmap });

                    resolve(score);
                })
        })
    }

    async getDiscordTag() {
        if (this.discord_tag) return this.discord_tag

        return await this._webscrape().discord_tag;
    }

    async getHighestPP() {
        if (this.top_pp) return this.top_pp

        return await this._webscrape().top_pp;
    }

    async _webscrape() {
        const profileSource = await request({
            uri: (`https://osu.ppy.sh/users/${encodeURIComponent(this.user_id)}`)
        });

        const discordWebscrape = /"discord":"(.+#\d{4})"/.exec(profileSource);
        const topppWebscrape = /"pp":([\d.]+)/.exec(profileSource);

        this.discord_tag = discordWebscrape ? discordWebscrape[1] : null;
        this.top_pp = topppWebscrape ? topppWebscrape[1] : null;

        return {
            discord_tag: this.discord_tag,
            top_pp: this.top_pp || 0,
        }
    }
}

module.exports = User;