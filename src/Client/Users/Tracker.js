
class Tracker {
    /**
     * Creates a new tracker object.
     * @param {Object} user
     * @param {Object} options
     * @param {Object} options.nextCheck 
     * @param {number} options.nextCheck.default Default time between checks (in hours)
     * @param {number} options.nextCheck.min Minimum time for next check (in hours)
     * @param {number} options.nextCheck.max Maximum time for next check (in hours)
     */
    constructor(user, options = {}) {
        this.user = user;

        this.nextCheck = {
            current: options.nextCheck.default || 0,
            min: options.nextCheck.min || 0.2,
            max: options.nextCheck.max || 3,
        }

        this.timer = null;
    }

    start() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(async () => {
            await this.check();
            this.clampNextCheck();
            this.start();
        }, (this.nextCheck.current * 60 * 60 * 1000));
    }

    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    clampNextCheck() {
        this.nextCheck.current = Math.min(Math.max(this.nextCheck.current, this.nextCheck.min), this.nextCheck.max);
    }

    async check() {
        console.log(`[${new Date(Date.now()).toUTCString()}] Tracking checked "${this.user.username}"`);

        const trackingData = await this.user.Datastore.getData('tracking');
        const members = this.user.getGuildMembers();

        // todo: update guild methods
        // for (const member of members) {
        //     member.guild.updateMember(member);
        // }

        // osu Top Plays Tracking Update
        await (async () => {
            const isInitilization = (trackingData && (!trackingData.bestScores || Object.keys(trackingData.bestScores).length === 0));

            const osuUser = await this.user.getOsuUser();
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

            const newScores = isInitilization
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

                    // todo: update guild methods
                    // for (const member of members) {
                    //     member.guild.postMemberOsuScore(member, score, gain);
                    // }
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

                // todo: update guild methods
                // this.user.Datastore.setSetting('tracking', trackingData);
            }

            this.nextCheck.current *= (!isInitilization && newScores.length > 0)
                ? 0.5
                : 2;
        })();
    }
}

module.exports = Tracker;