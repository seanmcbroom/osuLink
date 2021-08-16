const request = require('request-promise');
const Play = require('./Play');

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
     * Gets users most recent play
     * @returns {Promise<Play>} Most recent play
     */
    async getRecent() {
        return new Promise((resolve, reject) => {
            this.osu.api.apiCall('/get_user_recent', { m: 0, limit: 1, u: this.user_id, type: 'id' })
                .then(async recentPlaysData => {
                    const mostRecentPlayData = recentPlaysData[0];

                    if (!mostRecentPlayData) resolve('No recent plays found.');

                    const beatmap = await this.osu.getBeatmap({
                        id: mostRecentPlayData.beatmap_id
                    });

                    const play = new Play({
                        playData: mostRecentPlayData,
                        beatmap: beatmap
                    });

                    resolve(play);
                })
        })
    }

    async getDiscordTag() {
        if (this.discord_tag) return this.discord_tag

        await this._webscrape()

        return this.discord_tag;
    }

    async getHighestPP() {
        if (this.top_pp) return this.top_pp

        await this._webscrape()

        return this.top_pp;
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