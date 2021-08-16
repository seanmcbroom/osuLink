const Mods = require('./Mods');

class Play {
    /**
     * Creates a new Beatmap object
     * @param {Object} [osu] The main osu module
     * @param {Object} [options={}]
     * @param {Object} [options.playData]
     * @param {Object} [options.beatmap]
     */
    constructor(options) {
        const {
            playData = null,
            beatmap = null
        } = options;

        for (const x in playData) {
            this[x] = playData[x];
        };

        this.mods = new Mods({
            identifier: this.enabled_mods,
            identifierType: 'modbits'
        });

        this.beatmap = beatmap;

        this.xmisses = parseInt(this.countmiss);
        this.x300s = parseInt(this.count300);
        this.x100s = parseInt(this.count100);
        this.x50s = parseInt(this.count50);

        this.max_accuracy_objects = parseInt(this.beatmap.count_normal) + parseInt(this.beatmap.count_slider) + parseInt(this.beatmap.count_spinner);
        this.hit_accuracy_objects = (this.xmisses + this.x300s + this.x100s + this.x50s);

        this.accuracy = Math.round(((this.x300s * 300) + (this.x100s * 100) + (this.x50s * 50)) / (300 * (this.hit_accuracy_objects)) * 10000) / 100;
        this.fc_accuracy = Math.round(((this.xmisses * 300) + (this.x300s * 300) + (this.x100s * 100) + (this.x50s * 50)) / (300 * (this.hit_accuracy_objects)) * 10000) / 100;

        this.completion = Math.round((this.hit_accuracy_objects / this.max_accuracy_objects) * 10000) / 100
    }

    /**
     * Calculates star rating of play
     * @returns {Number}
     */
    getDifficulty() {
        return this.beatmap.getDifficulty({
            mods: this.mods
        });
    }

    /**
     * Calculates star rating of play
     * @returns {Number}
     */
    starRating() {
        return this.beatmap.stars({
            mods: this.mods
        });
    }

    /**
     * Calculate pp of play
     * @returns {Number}
     */
    pp() {
        const pp = this.beatmap.calculatePP({
            accuracy: this.accuracy,
            misses: this.xmisses,
            combo: this.maxcombo,
            mods: this.mods
        });

        return pp;
    }

    /**
    * Calculate pp of play (if full combo)
    * @returns {Number}
    */
    fcpp() {
        const pp = this.beatmap.calculatePP({
            accuracy: this.fc_accuracy,
            mods: this.mods
        });

        return pp;
    }
}

module.exports = Play;