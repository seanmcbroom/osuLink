const Beatmap = require('./osuModules/Beatmap');
const User = require('./osuModules/User');
const Mods = require('./osuModules/Mods');

const fs = require('fs');
const path = require('path');
const nodeosu = require('node-osu');
const download = require('download');

class osu {
    /**
     * Creates a new osu object
     * @param {Object} [options={}]
     * @param {String} [options.apiKey] Your osu api key
     * @param {String} [options.beatmapsDirectory] Directory to save beatmaps
     */
    constructor(options) {
        const {
            apiKey = null,
            beatmapsDirectory = null,
        } = options;

        this.api = new nodeosu.Api(apiKey);

        this.beatmapsDirectory = path.resolve(beatmapsDirectory);
    }

    /**
     * Get a User as an object.
     * @param {Object} [options={}] Beatmap id
     * @param {String|Int} [options.identifier] Username or Id
     * @param {'string'|'id'} [options.identifierType] Specify if identifier is a Username or Id
     * @returns {Promise<User>} The User object
     */
    async getUser(options) {
        let {
            identifier = '',
            identifierType = null,
        } = options;

        if (!identifierType) {
            if (isNaN(identifier)) {
                identifierType = 'string';
            } else {
                identifierType = 'id';
            }
        }

        return new Promise(async (resolve) => {
            const userData = await this.api.apiCall('/get_user', { u: identifier, type: identifierType }).then((u) => {
                return u[0]
            });

            if (!userData) resolve(null);

            const user = new User(this, {
                userData: userData,
            });

            resolve(user);
        });
    }

    /**
     * Get a Beatmap as an object.
     * @param {Object} [options={}]
     * @param {Number} [options.id] Beatmap id
     * @returns {Promise<Beatmap>} The Beatmap object
     */
    async getBeatmap(options) {
        const {
            id = 0,
        } = options;

        return new Promise(async (resolve) => {
            const beatmapData = await this.api.apiCall('/get_beatmaps', { b: id }).then((m) => {
                return m[0]
            });

            if (!beatmapData) resolve(null);

            const isBeatmapFinished = parseInt(beatmapData.approved) > 0
            const isDownloaded = await fs.existsSync(`${this.beatmapsDirectory}/${id}.osu`);
            let beatmapFileString;

            if (!isDownloaded) {
                beatmapFileString = await this._downloadBeatmap(beatmapData.beatmap_id, isBeatmapFinished);
            } else {
                beatmapFileString = (await fs.readFileSync(`${this.beatmapsDirectory}/${id}.osu`)).toString();
            }

            if (!beatmapFileString) resolve(null);

            const beatmap = new Beatmap({
                beatmapData: beatmapData,
                beatmapFileString: beatmapFileString,
            });

            resolve(beatmap);
        })
    }

    /**
    * Get mods as an object
    * @param {Object} [options={}]
    * @param {any} [options.identifier] Bits or String
    * @param {'string'|'modbits'} [options.identifierType] Specify if identifier is Bits or String
    */
    getMods(options) {
        const mods = new Mods(options);

        return mods;
    }

    async _downloadBeatmap(id, save = false) {
        const directory = (this.beatmapsDirectory || '.');

        await download(`https://osu.ppy.sh/osu/${id}`, directory, { filename: id + '.osu' });

        const beatmapFileString = (await fs.readFileSync(`${this.beatmapsDirectory}/${id}.osu`)).toString();

        if (!save || !this.beatmapsDirectory || fs.statSync(`${directory}/${id}.osu`).size > 100000) { // Delete beatmap
            await fs.unlinkSync(`${directory}/${id}.osu`);
        }

        return beatmapFileString
    }
}

module.exports = { osu, Beatmap, User, Mods };