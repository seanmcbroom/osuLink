const ojsama = require('ojsama');

const Difficulties = {
    [6.5]: 'Expert+',
    [5.3]: 'Expert',
    [4]: 'Insane',
    [2.7]: 'Hard',
    [0]: 'Easy'
}

class Beatmap {
    /**
     * Creates a new Beatmap object
     * @param {Object} [osu] The main osu module
     * @param {Object} [options={}]
     * @param {Object} [options.beatmapData={}] Data of beatmap
     * @param {String} [options.beatmapFileString] Beatmap file as string
     */
    constructor(options) {
        const {
            beatmapFileString = null,
            beatmapData = null
        } = options;

        for (const x in beatmapData) {
            this[x] = beatmapData[x];
        };

        this.parser = new ojsama.parser();

        this.parser.feed(beatmapFileString)

        this.cover_image = `https://assets.ppy.sh/beatmaps/${this.beatmapset_id}/covers/cover.jpg`;

        this.cover_thumbnail = `https://b.ppy.sh/thumb/${this.beatmapset_id}l.jpg`;

        this.link = `https://osu.ppy.sh/beatmapsets/${this.beatmapset_id}#osu/${this.beatmap_id}`;
    }

    /**
     * Check stars with mods
     * @param {Object} [options={}]
     * @param {Object} [options.mods]
     * @returns {String} stars
     */
    getDifficulty(options = {}) {
        const {
            mods = { modbits: 0 }
        } = options;

        let highestRating = 0;

        const stars = this.stars({
            mods: mods
        });

        for (const difficultyStars in Difficulties) {
            if (highestRating < difficultyStars) {
                if (stars >= difficultyStars) {
                    highestRating = difficultyStars;
                }
            }
        };

        return Difficulties[highestRating];
    }

    /**
     * Check stars with mods
     * @param {Object} [options={}]
     * @param {Object} [options.mods]
     * @returns {Number} stars
     */
    stars(options = {}) {
        const {
            mods = { modbits: 0 }
        } = options

        const starsTotal = new ojsama.diff().calc({
            map: this.parser.map,
            mods: mods.modbits
        }).total

        const format = Math.ceil(starsTotal * 100) / 100

        return format;
    }

    /**
     * Calculate beatmaps pp
     * @param {Object} [options]
     * @param {Number} [options.accuracy]
     * @param {Number} [options.misses]
     * @param {Number} [options.combo]
     * @param {Number} [options.mods]
     * @returns {Number}
     */
    calculatePP(options = {}) {
        const {
            accuracy = 100,
            misses = 0,
            combo = parseInt(this.max_combo),
            mods = { modbits: 0 }
        } = options;

        const pp = ojsama.ppv2({
            map: this.parser.map,
            acc_percent: accuracy,
            nmiss: misses,
            combo: combo,
            mods: mods.modbits
        });

        const format = Math.round(pp.total * 100) / 100

        return format;
    }

}

module.exports = Beatmap;