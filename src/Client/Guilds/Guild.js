const { Datastore } = require('../Modules/Datastore');

class Guild {
    constructor(client, guild, options) {
        const {
            DataFormat = {}
        } = options;

        this.client = client;

        for (const x in guild) {
            this[x] = guild[x];
        };

        this.mostRecentBeatmap = null;

        this.maxBinds = 10;

        this.Datastore = new Datastore('Guild', {
            Database: this.client.Database,
            DataFormat: DataFormat,
            id: this.id
        });

        this.client.interactionHandler.loadInteractionsWithTagsOnGuild(this.id, ['premium', 'dev', 'management']);
    }

    async updateMember(Member) {
        const osuUser = await Member.user.getOsuUser();
        const binds = await this.Datastore.getData('Binds');

        if (!binds || Object.keys(binds).length < 1) return

        const variables = {
            'TOP_PP': async () => (await osuUser.getHighestPP() || 0),
            'PP': async () => (osuUser.pp_raw || 0),
            'RANK': async () => (osuUser.pp_rank || 0),
            'CTRY_RANK': async () => (osuUser.pp_country_rank || 0),
            'CTRY': async () => (osuUser.country || ""),
            'RANKED_SCORE': async () => (osuUser.ranked_score || 0),
            'SCORE': async () => (osuUser.total_score || 0),
            'ACCURACY': async () => (osuUser.accuracy || 0),
            'PLAYTIME': async () => (osuUser.total_seconds_played || 0),
            'VERIFIED': async () => (1)
        };

        binds.forEach(async bind => {
            const role = this.roles.cache.find(r => r.id === bind.ID);

            if (role && Member.roles) {
                let meetsRequirements = false;
                let condition = bind.C;

                for (const i in variables) {
                    const regex = new RegExp(i, 'g');
                    const value = osuUser ? await variables[i]() : 0;

                    condition = condition.replace(regex, value);
                }

                meetsRequirements = Util.evalStringExpression(condition);

                if (meetsRequirements) {
                    Member.roles.add(role).catch(() => { });
                } else {
                    Member.roles.remove(role).catch(() => { });
                }
            }
        });
    }

    async postMemberOsuScore(Member, Score, Gain) {
        const trackingWhitelist = await this.Datastore.getData('trackingWhitelist');
        const trackingChannelId = await this.Datastore.getData('trackingChannel');

        const channel = this.channels.cache.find(c => c.id === trackingChannelId);

        if (!channel) return
        if (!trackingWhitelist[Member.id]) return
        if (trackingWhitelist[Member.id].top < Score.profile_rank) return

        channel.send({
            content: `New **#${Score.profile_index}** for ${Score.player.username}!`,
            embeds: [
                new Discord.MessageEmbed()
                    .setColor(this.client.Settings.Colors.Main)
                    .setAuthor(`${Score.beatmap.title} by ${Score.beatmap.creator}`, Score.player.avatar, Score.beatmap.link)
                    .setThumbnail(Score.beatmap.cover_thumbnail)
                    .setDescription(
                        `${Emojis[Score.getDifficulty()]} __**${Score.beatmap.version}**__ ${Score.mods != '' ? `**${Score.mods}**` : ''} [${Score.starRating()}★]\n` +
                        `• **${Emojis[Score.rank]}** • ${`**${Score.profile_pp}pp (+${Gain}pp)**`} • ${Score.accuracy}%\n` +
                        `• ${Util.addCommas(Score.score)} • x${Score.maxcombo}/${Score.beatmap.max_combo} • <${Score.count300}/${Score.count100}/${Score.count50}/${Score.countmiss}>\n` +
                        `${Score.completion < 100 && `• **Completion:** *${Score.completion}%*` || ''}`
                    )
                    .setFooter(`Score set ${Util.msToHumanReadable((Date.now() - new Date(Score.date)))} ago on the offical osu server.`)
            ]
        });
    }
}

module.exports = Guild;